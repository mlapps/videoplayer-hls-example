/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License)
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
import { VideoPlayer } from '@lightningjs/sdk'
import Hls from 'hls.js'

let player = null
const defaults = {
  debug: false,
}

function handleUnrecoverableError(player, errorEvent) {
  if (VideoPlayer._consumer) {
    VideoPlayer._consumer.fire('$videoPlayerError', errorEvent, VideoPlayer.currentTime)
    VideoPlayer._consumer.fire('$videoPlayerEvent', 'Error', errorEvent, VideoPlayer.currentTime)
  }
  player.destroy()
}

const unload = videoEl => {
  if (player && player.destroy && player.destroy instanceof Function) {
    player.destroy()
    player = null
  }
  videoEl.removeAttribute('src')
  videoEl.load()
}

export const loader = (url, videoEl, options = {}) => {
  return new Promise(resolve => {
    unload(videoEl)

    player = new Hls({ ...defaults, ...options })
    player.autoLevelCapping = options.autoLevelCapping || -1

    player.on(Hls.Events.MANIFEST_PARSED, () => resolve())
    player.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.MEDIA_ERROR:
            switch (data.details) {
              case Hls.ErrorDetails.MANIFEST_INCOMPATIBLE_CODECS_ERROR:
                handleUnrecoverableError(player, event)
                break
              default:
                player.recoverMediaError()
                break
            }
            break

          case Hls.ErrorTypes.NETWORK_ERROR:
            switch (data.details) {
              case Hls.ErrorDetails.FRAG_LOAD_ERROR:
                player.currentLevel = data.frag.start + data.frag.duration + 0.1
                break

              case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
                handleUnrecoverableError(player, event)
                break

              default:
                player.startLoad()
                break
            }
            break

          default:
            handleUnrecoverableError(player, event)
            break
        }
      }
    })

    player.loadSource(url)
    player.attachMedia(videoEl)
  })
}

export const unloader = videoEl => {
  return new Promise(resolve => {
    unload(videoEl)
    resolve()
  })
}
