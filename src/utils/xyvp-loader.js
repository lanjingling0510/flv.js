/*
 * Copyright (C) 2018 QuanminTV. All Rights Reserved.
 *
 * @author rainie <chenyutian0510@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");\
 * you may not use this file except in compliance with the License.\
 * You may obtain a copy of the License at\
 *
  *     http://www.apache.org/licenses/LICENSE-2.0
*
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
* limitations under the License.
 */


class XYVPLoader {
    static load(url, resolve, reject) {
        const doc = document;
        const head = doc.getElementsByTagName('head')[0];
        const readyState = 'readyState';
        const onreadystatechange = 'onreadystatechange';

        const el = doc.createElement('script');
        if (el[readyState]) {
            el[onreadystatechange] = () => {
                if (el[readyState] == 'loaded' || el[readyState] == 'complete') {
                    el[onreadystatechange] = null;
                    resolve(global.xyvp);
                }
            };
        } else {
            el.onload = () => {
                el.onload = null;
                resolve(global.xyvp);
            };
        }
        el.onerror = () => {
            reject('Load failed!');
        };

        el.async = 1;
        el.src = url;
        head.insertBefore(el, head.lastChild);
    }

    static promise(url) {
        return new Promise((resolve, reject) => {
            XYVPLoader.load(url, resolve, reject);
        });
    }
}

export default XYVPLoader;
