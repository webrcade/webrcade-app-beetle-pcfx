import { ControlsTab } from '@webrcade/app-common';

export class Pce6GamepadControls extends ControlsTab {
  render() {
    return (
      <>
        {[
          this.renderControl('start', 'Run'),
          this.renderControl('select', 'Select'),
          this.renderControl('dpad', 'Move'),
          this.renderControl('lanalog', 'Move'),
          this.renderControl('b', 'I'),
          this.renderControl('a', 'II'),
          this.renderControl('y', 'IV'),
          this.renderControl('x', 'III'),
          this.renderControl('lbump', 'V'),
          this.renderControl('rbump', 'VI'),
        ]}
      </>
    );
  }
}

export class Pce6KeyboardControls extends ControlsTab {
  render() {
    return (
      <>
        {[
          this.renderKey('Enter', 'Run'),
          this.renderKey('ShiftRight', 'Select'),
          this.renderKey('ArrowUp', 'Up'),
          this.renderKey('ArrowDown', 'Down'),
          this.renderKey('ArrowLeft', 'Left'),
          this.renderKey('ArrowRight', 'Right'),
          this.renderKey('KeyX', 'I'),
          this.renderKey('KeyZ', 'II'),
          this.renderKey('KeyS', 'IV'),
          this.renderKey('KeyA', 'III'),
          this.renderKey('KeyQ', 'V'),
          this.renderKey('KeyW', 'VI'),
        ]}
      </>
    );
  }
}
