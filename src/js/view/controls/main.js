/**
 * Created by hoho on 2018. 7. 20..
 */
import OvenTemplate from "view/engine/OvenTemplate";
import PlayButton from "view/controls/playButton";
import VolumeButton from "view/controls/volumeButton";
import ProgressBar from "view/controls/progressBar";
import TimeDisplay from "view/controls/timeDisplay";
import FullScreenButton from "view/controls/fullScreenButton";
import SettingPanel from "view/controls/settingPanel";
import PanelManager from "view/global/PanelManager";
import {
    READY,
    CONTENT_META,
    PROVIDER_RTMP,
    ERROR
} from "api/constants";

const Controls = function($container, api){
    let volumeButton = "", playButton= "", progressBar = "", timeDisplay = "", fullScreenButton = "";
    let panelManager = PanelManager();
    let generateMainPanelData = function(){
        let panel = {title : "Settings", isMain : true, body : []};
        let currentSource = api.getCurrentQuality();
        if(api.getDuration() !== Infinity && currentSource.type !== PROVIDER_RTMP){
            let body = {
                title : "Speed",
                value :  api.getPlaybackRate() === 1 ? "Normal" : api.getPlaybackRate(),
                type : "playbackrate"
            };
            panel.body.push(body);
        }

        if (api.getQualityLevels().length > 0) {
            let currentQuality = api.getCurrentQuality();

            let body = {
                title : "Source",
                value : currentQuality ? currentQuality.label : "Default",
                type : "qualitylevel"
            };

            panel.body.push(body);
        }
        return panel;
    };

    const onRendered = function($current, template){

        let initTimeDisplay = function(data){
            if(timeDisplay){
                timeDisplay.destroy();
            }
            timeDisplay = TimeDisplay($current.find(".ovp-left-controls"), api, data);
        };
        let initProgressBar = function(){
            if(progressBar){
                progressBar.destroy();
            }
            progressBar = ProgressBar($current.find(".ovp-progressbar-container"), api);
        };

        playButton = PlayButton($current.find(".ovp-left-controls"), api);
        volumeButton = VolumeButton($current.find(".ovp-left-controls"), api);
        fullScreenButton = FullScreenButton($current.find(".ovp-right-controls"), api);

        api.on(CONTENT_META, function(data){
            initTimeDisplay(data);
            if(data.duration === Infinity){
                //live
                if(progressBar){
                    progressBar.destroy();
                }
            }else{
                //vod
                initProgressBar();
            }
        }, template);
    };
    const onDestroyed = function(template){
        api.off(CONTENT_META, null, template);
        if(timeDisplay){
            timeDisplay.destroy();
        }
        if(playButton){
            playButton.destroy();
        }
        if(progressBar){
            progressBar.destroy();
        }
        if(fullScreenButton){
            fullScreenButton.destroy();
        }
        if(volumeButton){
            volumeButton.destroy();
        }
    };
    const events = {
        "mouseleave .ovp-controls" : function(event, $current, template){
            event.preventDefault();

            volumeButton.setMouseDown(false);
            $current.find(".ovp-volume-slider-container").removeClass("active");
        },
        "click .ovp-setting-button" : function(event, $current, template){
            event.preventDefault();
            if(panelManager.size() > 0){
                panelManager.clear();
            }else{
                let panelData = generateMainPanelData();
                panelManager.add(SettingPanel($current, api, panelData));
            }
        }
    };

    return OvenTemplate($container, "Controls",  null , events, onRendered, onDestroyed);
};

export default Controls;
