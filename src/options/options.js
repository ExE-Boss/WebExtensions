/*
 * Copyright (C) 2017 ExE Boss
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {getDefaultTheme, processMessage, processThemeBrowserAction} from "../shared.js";
import hyperHTML from "../vendor/hyperhtml/index.js";

document.addEventListener("DOMContentLoaded", async () => {
	return Promise.all([
		i18nInit(),
		initOptions()
	]);
});

async function initOptions() {
	const themes = ["default", "photon", "australis", "classic", "pastel-svg", "aero"];
	const data = (await browser.storage.sync.get({
		theme: "default",
		preferredWindowState:	"maximized"
	}));
	const currentTheme = data.theme;
	const themeSelector = document.querySelector("#theme");

	const preferredWindowStateSelector = document.querySelector("#fullscreenExitState");
	for (let i = 0; i < preferredWindowStateSelector.length; i++) {
		const option = preferredWindowStateSelector.item(i);
		if (option.value === data.preferredWindowState) {
			preferredWindowStateSelector.selectedIndex = i;
			option.setAttribute("selected", true);
		} else {
			option.selected = false;
		}
	}
	/**
	 * @param	{string}	theme	The theme name.
	 * @return	{ThemeConf?}	The theme configuration.
	 * @throws	If the theme can’t be loaded.
	 */
	const getConfig = async theme => {
		if (theme === "default") {
			return {};
		}
		const response = await fetch(`/themes/${theme}/theme.json`);
		if (!response.ok) {
			throw `Can’t load theme ${theme}`;
		}
		return await response.json();
	};

	/** @type {HTMLElement} */
	const options = [];
	(await Promise.all(themes.map(async theme => {
		const config = {};
		if (theme === "default") {
			config.name	= "__MSG_theme_default__";
		} else {
			try {
				Object.assign(config, await getConfig(theme));
			} catch (e) {
				console.warn(e);
				return undefined;
			}
		}
		/** @type {HTMLOptionElement} */
		const o = hyperHTML`
			<option value="${theme}">
				${processMessage(config.name, "options")}
			</option>`;
		if (theme === "default") o.setAttribute("title", browser.i18n.getMessage("options_theme_default_title"));
		if (theme === currentTheme) {
			o.setAttribute("selected", true);
		}
		return o;
	}))).forEach(o => {
		if (o instanceof HTMLElement) {
			themeSelector.appendChild(o);
			options.push(o);
		}
	});

	document.querySelectorAll("select[data-save]").forEach(select => {
		select.addEventListener("change", async () => {
			if (select.selectedIndex >= 0) {
				const {value} = select.item(select.selectedIndex);
				const data = {};
				data[select.dataset.save] = value;
				browser.storage.sync.set(data);

				if (select.dataset.save === "theme") {
					let themeDir = value;
					if (value === "default") {
						themeDir = await getDefaultTheme();
					}
					const themeJSON = Object.assign({
						default_extension: "svg",
						browser_action: "firefox",
					}, await fetch(`/themes/${themeDir}/theme.json`).then(r => r.json()));
					browser.browserAction.setIcon({
						path: processThemeBrowserAction({themeDir, themeJSON})
					});
				}
			}
		});
	});
}

async function i18nInit() {
	document.querySelectorAll("label[for]:not([data-i18n])").forEach(translatable => {
		const text = browser.i18n.getMessage(`options_${translatable.getAttribute("for")}`);
		if (text.length > 0)
			translatable.textContent = text;
	});

	document.querySelectorAll("[data-i18n]").forEach(translatable => {
		const text = browser.i18n.getMessage(translatable.dataset.i18n);
		if (text.length > 0)
			translatable.textContent = text;
	});
}
