/*
 * Copyright (C) 2017 Shenzhen Onething Technologies Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BaseLoader, LoaderStatus, LoaderErrors } from './loader.js';
import { RuntimeException } from '../utils/exception.js';
import XYVPLoader from '../utils/xyvp-loader';

class XYLoader extends BaseLoader {
    constructor(seekHandler, config) {
        super('xy-loader');

        this._seekHandler = seekHandler;
        this._config = config;

        this._receivedLength = 0;

        const reg = /^https:/;
        const protocal = reg.test(global.document.location.href) ? 'https' : 'http';
        const libUrl = protocal + '://fcrc-video.xycdn.com/h5/test/xyvp-live.js';
        this._loadPromise = XYVPLoader.promise(libUrl);

        this._xylive = null;
    }

    set onDataArrival(callback) {
        this._onDataArrival = callback;
    }

    set onError(callback) {
        this._onError = callback;
    }

    destroy() {
        if (this._xylive) {
            this._xylive.dispose();
            this._xylive = null;
        }
        super.destroy();
    }

    open(dataSource, range) {
        this._status = LoaderStatus.kConnecting;

        this._loadPromise
            .then(({ XYLive, XYLiveEvent }) => {
                const video = document.getElementsByName('videoElement')[0];
                this._xylive = new XYLive({
                    url: dataSource.url,
                    video: video
                });
                this._xylive.on(XYLiveEvent.FLV_DATA, data => {
                    let byteStart = range.from + this._receivedLength;
                    this._receivedLength += data.byteLength;
                    if (this._onDataArrival) {
                        this._onDataArrival(data, byteStart, this._receivedLength);
                    }
                });
                this._xylive.on(XYLiveEvent.ERROR, errMsg => {
                    this._status = LoaderStatus.kError;
                });
                this._xylive.open();
                this._status = LoaderStatus.kBuffering;
            })
            .catch(msg => {
                this._status = LoaderStatus.kError;
                if (this._onError) {
                    this._onError(LoaderErrors.HTTP_STATUS_CODE_INVALID, { msg });
                } else {
                    throw new RuntimeException('RangeLoader: Http code invalid, ' + msg);
                }
            });
    }

    abort() {
        this._xylive.close();
        this._status = LoaderStatus.kComplete;
    }
}

export default XYLoader;
