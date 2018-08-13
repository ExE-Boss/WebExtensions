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
/// <reference path="./types.d.ts"/>
"use strict";

browser.pageAction.onClicked.addListener((tab) => {
	switch (tab.status) {
		case "loading": {
			return;
		} case "complete": {
			browser.tabs.reload(tab.id);
			return;
		} default: return;
	}
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	browser.pageAction.show(tabId);
	if ("status" in changeInfo) {
		switch (changeInfo.status) {
			case "loading": {
				browser.pageAction.setTitle({
					tabId,
					title: browser.i18n.getMessage("pageAction_stop"),
				});
				browser.pageAction.setIcon({
					tabId,
					path: `icons/context-fill/reload-to-stop.svg?tabId=${encodeURIComponent(tabId)}&token=${Math.random() * 65536}`,
				});
				return;
			} case "complete": {
				browser.pageAction.setTitle({
					tabId,
					title: browser.i18n.getMessage("pageAction_reload"),
				});
				browser.pageAction.setIcon({
					tabId,
					path: `icons/context-fill/stop-to-reload.svg?tabId=${encodeURIComponent(tabId)}&token=${Math.random() * 65536}`,
				});
				return;
			} default: return;
		}
	}
});

browser.tabs.onCreated.addListener((tab) => {
	if ("id" in tab) {
		browser.pageAction.show(tab.id);
	}
});

(async () => {
	// Skip unnecessary initialisation on newer Firefox versions
	const {version: browserVersion} = await browser.runtime.getBrowserInfo();
	if ("59".localeCompare(browserVersion, [], {numeric: true}) > 0) {
		const tabs = await browser.tabs.query({});
		tabs.forEach(tab => {
			if ("id" in tab) {
				browser.pageAction.show(tab.id);
			}
		});
	}
})();
