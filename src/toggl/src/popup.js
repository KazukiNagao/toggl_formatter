'use strict';

import './popup.css';
const axiosBase = require('axios');
const axios = axiosBase.create({
    baseURL: 'https://api.track.toggl.com/',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    responseType: 'json'
});


(function() {
    function main() {
        var key = "";
        var workspaceID = "";
        const saveButton = document.getElementById('save-button');
        const resultArea = document.getElementById('result');
        const formatButton = document.getElementById('format-button');

        saveButton.onclick = () => {
            const apiKeyElem = document.getElementById('api-key');
            chrome.storage.local.set({ 'api_key': apiKeyElem.value }, () => {});
            key = apiKeyElem.value;

            const workspaceElem = document.getElementById('workspace-key');
            chrome.storage.local.set({ 'ws_key': workspaceElem.value }, () => {});
            workspaceID = workspaceElem.value;
        }
        chrome.storage.local.get(['api_key', 'ws_key'], (v) => {
            if (v.api_key === undefined) return;
            const apiKeyElem = document.getElementById('api-key');
            apiKeyElem.value = v.api_key;
            key = v.api_key;
            resultArea.textContent = "";

            const workspaceElem = document.getElementById('workspace-key');
            workspaceElem.value = v.ws_key;
            workspaceID = v.ws_key;
        });

        if (key === "") {
            resultArea.textContent = "Please save APIKEY.";
        }
        var result = "";
        formatButton.onclick = async() => {
            const today = new Date();
            const todayStr = format('YYYY-MM-DD', today);
            const res = await axios.get(`reports/api/v2/details?workspace_id=${workspaceID}&since=${todayStr}&until=${todayStr}&user_agent=toggl_chrome_plugin`, {
                auth: {
                    username: key,
                    password: 'api_token',
                }
            });
            const detailedData = res.data.data;
            detailedData.sort((a, b) => a.start.localeCompare(b.start));

            for (const d of detailedData) {
                const start = new Date(d.start);
                const end = new Date(d.end);
                const project = (d.project) ? d.project + ':' : '';
                result += `${format('hh:mm', start)}〜${format('hh:mm', end)} ${project}${d.description}\n`;
            }
            resultArea.textContent = result;
        }
    }

    function format(format, date) {
        const year_str = date.getFullYear();
        const month_str = 1 + date.getMonth();
        const day_str = date.getDate();
        const hour_str = date.getHours();
        const minute_str = date.getMinutes();
        const second_str = date.getSeconds();

        format = format.replace(/YYYY/g, year_str);
        format = format.replace(/MM/g, zero_padding(month_str));
        format = format.replace(/DD/g, zero_padding(day_str));
        format = format.replace(/hh/g, zero_padding(hour_str));
        format = format.replace(/mm/g, zero_padding(minute_str));
        format = format.replace(/ss/g, zero_padding(second_str));
        return format;
    }

    function zero_padding(s) {
        return ('0' + s).slice(-2);
    }
    main();
})();