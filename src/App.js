/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Log, VideoPlayer, Lightning } from '@lightningjs/sdk'
import { loader, unloader } from './Hls'

export default class App extends Lightning.Component {
  static _template() {
    return {
      w: 1920,
      h: 1080,
      Wrapper: {
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xfffbb03b,
        Text: {
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2,
          text: {
            text: 'Video Loading...',
            fontFace: 'Regular',
            fontSize: 64,
            textColor: 0xbbffffff,
          },
        },
      },
    }
  }

  _init() {
    this._startVideo()
  }

  async _startVideo() {
    VideoPlayer.close()
    VideoPlayer.consumer(this)
    VideoPlayer.loader(loader)
    VideoPlayer.unloader(unloader)

    const playerSettings = {
      debug: true,
    }

    VideoPlayer.open(
      'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
      playerSettings
    )

    Log.info('Video playing with HLS.js player')
  }

  $videoPlayerError(data) {
    Log.error('Error playing video', data)
  }

  $videoPlayerEvent(event, eventData) {
    Log.info({ event, eventData })
  }

  $videoPlayerPlaying() {
    this.tag('Wrapper').visible = false
  }

  $videoPlayerEnded() {
    VideoPlayer.reload()
  }

  _handleEnter() {
    VideoPlayer.playPause()
  }

  _handlePlay() {
    VideoPlayer.play()
  }

  _handlePause() {
    VideoPlayer.pause()
  }

  _handlePlayPause() {
    VideoPlayer.playPause()
  }

  _handleForward() {
    VideoPlayer.skip(10)
  }

  _handleRewind() {
    VideoPlayer.skip(-10)
  }

  _handleRight() {
    VideoPlayer.skip(10)
  }

  _handleLeft() {
    VideoPlayer.skip(-10)
  }

  _handleKey(event) {
    Log.info(event)
  }

  _handleBack() {
    this.closeApp()
  }

  closeApp() {
    Log.info('Closing app...')
    VideoPlayer.close()
    this.application.closeApp()
  }
}
