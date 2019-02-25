import { mount } from 'enzyme';
import { h } from 'preact';
import { expect } from 'chai';
import sinon from 'sinon';
import leaflet from 'leaflet';
import Marker from './Marker';

describe('Maker', () => {
  const sandbox = sinon.createSandbox();
  const defaultProps = {
    leafletMap: new leaflet.Map(document.createElement('div')),
    position: [59.3367, 18.0667],
  };

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw an error if no leafletMap prop is provided', () => {
    expect(() => mount(<Marker />)).to.throw(/leafletMap/);
  });

  it('should throw an error if position prop isnt provided', () => {
    expect(() => mount(<Marker {...defaultProps} position={undefined} />)).to.throw(/position/);
  });

  it('should pass provided options props to Marker', () => {
    const options = {
      alt: 'tiny',
      attribution: 'cred to you',
      autoPan: false,
      autoPanPadding: 100,
      autoPanSpeed: 4000,
      bubblingMouseEvents: true,
      draggable: true,
      icon: 'some icon',
      interactive: false,
      keyboard: true,
      opacity: 0.5,
      pane: 'markerPane',
      riseOffset: 20,
      riseOnHover: false,
      title: 'hi there',
      zIndexOffset: 100,
    };
    sandbox.spy(leaflet, 'Marker');
    mount(<Marker {...defaultProps} {...options} />);

    Object.keys(options)
      .forEach((option) => {
        expect(leaflet.Marker).to.have.been.calledWith(sinon.match.any, sinon.match({
          [option]: options[option],
        }));
      });
  });

  it('should add event listeners for each prop prefixed with "on"', () => {
    const onSomeRandomEvent = sinon.spy();
    const wrapper = mount(<Marker {...defaultProps} onSomeRandomEvent={onSomeRandomEvent} />);

    wrapper.instance().marker.fire('someRandomEvent', new Event('random'));

    expect(onSomeRandomEvent).to.have.been.calledWith(sinon.match({ bubbles: sinon.match.bool }));
  });

  it('should remove event listeners when prop is removed', () => {
    const onSunGoesDown = sinon.spy();
    const wrapper = mount(<Marker {...defaultProps} onSunGoesDown={onSunGoesDown} />);
    wrapper.setProps({ onSunGoesDown: undefined });

    wrapper.instance().marker.fire('sunGoesDown');

    expect(onSunGoesDown).to.not.have.been.called;
  });

  it('should add event listeners when prop is added', () => {
    const wrapper = mount(<Marker {...defaultProps} />);

    const onSunGoesUp = sinon.spy();
    wrapper.setProps({ onSunGoesUp });

    wrapper.instance().marker.fire('sunGoesUp', new Event('sunGoesUp'));

    expect(onSunGoesUp).to.have.been.calledWith(sinon.match({ bubbles: false }));
  });

  it('should remove listeners upon unmount', () => {
    const onClose = sinon.spy();
    const wrapper = mount(<Marker {...defaultProps} onClose={onClose} />);

    const { marker } = wrapper.instance();
    wrapper.unmount();

    marker.fire('close');

    expect(onClose).to.not.have.been.called;
  });

  it('should add marker to map', () => {
    const leafletMap = new leaflet.Map(document.createElement('div'));
    const wrapper = mount(<Marker {...defaultProps} leafletMap={leafletMap} />);

    expect(leafletMap.hasLayer(wrapper.instance().marker)).to.equal(true);
  });

  it('should remove marker from map upon unmount', () => {
    const leafletMap = new leaflet.Map(document.createElement('div'));
    const wrapper = mount(<Marker {...defaultProps} leafletMap={leafletMap} />);
    const { marker } = wrapper.instance();

    wrapper.unmount();

    expect(leafletMap.hasLayer(marker)).to.equal(false);
  });
});
