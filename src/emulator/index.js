import {
  DisplayLoop,
  ScriptAudioProcessor,
  RetroAppWrapper,
  LOG,
} from '@webrcade/app-common';

export class Emulator extends RetroAppWrapper {

  GAME_SRAM_NAME = 'game.srm';
  SAVE_NAME = 'sav';

  constructor(app, debug = false) {
    super(app, debug);

    // Allow game saves to persist after loading state
    this.saveManager.setDisableGameSaveOnStateLoad(false);

    this.audioStarted = 0;

    this.total = 0;
    this.count = 0;
    this.audioCallback = (offset, length) => {
      this.total += length;
      this.count = this.count + 1;

      if (this.count === 60) {
        //console.log("total: " + this.total);
        this.total = 0;
        this.count = 0;
      }

      length = length << 1;
      const audioArray = new Int16Array(window.Module.HEAP16.buffer, offset, length);
      this.audioProcessor.storeSoundCombinedInput(audioArray, 2, length, 0, 32768);
    };
  }

  createAudioProcessor() {
    return new ScriptAudioProcessor(
      2,
      44100,
      8192 + 4096,
      2048
    ).setDebug(this.debug);
  }

  onFrame() {
    if (this.audioStarted !== -1) {
      if (this.audioStarted > 1) {
        this.audioStarted = -1;
        // Start the audio processor
        this.audioProcessor.start();
      } else {
        this.audioStarted++;
      }
    }
  }

  getScriptUrl() {
    return 'js/mednafen_pcfx_libretro.js';
  }

  getPrefs() {
    return this.prefs;
  }

  createDisplayLoop(debug) {
    const loop = new DisplayLoop(
      60,
      true, // vsync
      debug, // debug
      false,
    );
    // loop.setAdjustTimestampEnabled(false);
    return loop;
  }

  async saveState() {
    const { saveStatePath, started } = this;
    const { FS, Module } = window;

    try {
      if (!started) {
        return;
      }

      // Save to files
      Module._cmd_savefiles();

      let path = '';
      const files = [];
      let s = null;

      path = `/home/web_user/retroarch/userdata/saves/${this.GAME_SRAM_NAME}`;
      LOG.info('Checking: ' + path);
      try {
        s = FS.readFile(path);
        if (s) {
          LOG.info('Found save file: ' + path);
          files.push({
            name: this.SAVE_NAME,
            content: s,
          });
        }
      } catch (e) {}

      if (files.length > 0) {
        if (await this.getSaveManager().checkFilesChanged(files)) {
          await this.getSaveManager().save(
            saveStatePath,
            files,
            this.saveMessageCallback,
          );
        }
      } else {
        await this.getSaveManager().delete(path);
      }
    } catch (e) {
      LOG.error('Error persisting save state: ' + e);
    }
  }

  async loadState() {
    const { saveStatePath } = this;
    const { FS } = window;

    // Write the save state (if applicable)
    try {
      // Load
      const files = await this.getSaveManager().load(
        saveStatePath,
        this.loadMessageCallback,
      );

      if (files) {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          if (f.name === this.SAVE_NAME) {
            LOG.info(`writing ${this.GAME_SRAM_NAME} file`);
            FS.writeFile(
              `/home/web_user/retroarch/userdata/saves/${this.GAME_SRAM_NAME}`,
              f.content,
            );
          }
        }

        // Cache the initial files
        await this.getSaveManager().checkFilesChanged(files);
      }
    } catch (e) {
      LOG.error('Error loading save state: ' + e);
    }
  }

  applyGameSettings() {
    // const { Module } = window;
    // const props = this.getProps();
    // let options = 0;
    // Module._wrc_set_options(options);
  }

  // resizeScreen(canvas) {
  //   // Determine the zoom level
  //   let zoomLevel = 0;
  //   if (this.getProps().zoomLevel) {
  //     zoomLevel = this.getProps().zoomLevel;
  //   }

  //   const wsize = 106 + zoomLevel;
  //   const hsize = 96 + zoomLevel;
  //   canvas.style.setProperty('width', `${wsize}vw`, 'important');
  //   canvas.style.setProperty('height', `${hsize}vh`, 'important');
  //   canvas.style.setProperty('max-width', `calc(${hsize}vh*1.333)`, 'important');
  //   canvas.style.setProperty('max-height', `calc(${wsize}vw*0.75)`, 'important');
  // }

  // getShotAspectRatio() { return 1.333; }

  isForceAspectRatio() {
    return false;
  }

  getDefaultAspectRatio() {
    return 1.333;
  }

  resizeScreen(canvas) {
    this.canvas = canvas;
    // // Determine the zoom level
    // let zoomLevel = 0;
    // if (this.getProps().zoomLevel) {
    //   zoomLevel = this.getProps().zoomLevel;
    // }

    // const size = 96 + zoomLevel;
    // canvas.style.setProperty('width', `${size}vw`, 'important');
    // canvas.style.setProperty('height', `${size}vh`, 'important');
    // canvas.style.setProperty('max-width', `calc(${size}vh*1.22)`, 'important');
    // canvas.style.setProperty('max-height', `calc(${size}vw*0.82)`, 'important');
    this.updateScreenSize();
  }

  getShotAspectRatio() { return this.getDefaultAspectRatio(); }
}
