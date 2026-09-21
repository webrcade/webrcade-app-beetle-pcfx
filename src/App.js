import React from "react";

import {
  TouchOverlay,
  WebrcadeRetroApp
} from '@webrcade/app-common';

import { Emulator } from './emulator';
import { EmulatorPauseScreen } from './pause';

import './App.scss';

class App extends WebrcadeRetroApp {

  constructor() {
    super();
    this.state = {
      ...this.state,
      showCanvas: false,
    };
  }

  // Called once by Emulator.onFrame() -- gates the upper-right touch
  // overlay (Pause icon) so it doesn't render before the emulator itself
  // exists, same as the other apps' TouchOverlay.
  showCanvas() {
    this.setState({ showCanvas: true });
  }

  createEmulator(app, isDebug) {
    return new Emulator(app, isDebug);
  }

  getBiosMap() {
    return {
      '08e36edbea28a017f79f8d4f7ff9b6d7': 'pcfx.rom',
    };
  }

  getBiosUrls(appProps) {
    return appProps.pcfx_bios;
  }

  renderPauseScreen() {
    const { appProps, emulator } = this;

    return (
      <EmulatorPauseScreen
        emulator={emulator}
        appProps={appProps}
        closeCallback={() => this.resume()}
        exitCallback={() => {
          this.exitFromPause();
        }}
        isEditor={this.isEditor}
        isStandalone={this.isStandalone}
      />
    );
  }

  render() {
    const { showCanvas } = this.state;

    return (
      <>
        {super.render()}
        <TouchOverlay show={showCanvas} />
      </>
    );
  }
}

export default App;
