import { ScaleLine as OlScaleLine } from 'ol/control';
import ProjUnits from 'ol/proj/Units';
import { getPointResolution, METERS_PER_UNIT } from 'ol/proj';
import { assert } from 'ol/asserts';
import { Units } from 'ol/control/ScaleLine';

const LEADING_DIGITS = [1, 2, 5];
const SCALE = 'scale';
/**
 * huht
 * 重写了ol/control/ScaleLine类的updateElement_方法
 * 使其支持scale模式的展示
 */
class ScaleLine extends OlScaleLine {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  updateElement_() {
    let viewState = this.viewState_;
    if (!viewState) {
      if (this.renderedVisible_) {
        this.element.style.display = 'none';
        this.renderedVisible_ = false;
      }
      return;
    }

    let center = viewState.center;
    let projection = viewState.projection;
    let units = this.getUnits();
    let pointResolutionUnits =
      units === Units.DEGREES ? ProjUnits.DEGREES : ProjUnits.METERS;
    let pointResolution = getPointResolution(
      projection,
      viewState.resolution,
      center,
      pointResolutionUnits
    );
    if (
      projection.getUnits() !== ProjUnits.DEGREES &&
      projection.getMetersPerUnit() &&
      pointResolutionUnits === ProjUnits.METERS
    ) {
      pointResolution *= projection.getMetersPerUnit();
    }

    let nominalCount = this.minWidth_ * pointResolution;
    let suffix = '';
    let scale = 0;
    if (units === Units.DEGREES) {
      let metersPerDegree = METERS_PER_UNIT[ProjUnits.DEGREES];
      if (projection.getUnits() === ProjUnits.DEGREES) {
        nominalCount *= metersPerDegree;
      } else {
        pointResolution /= metersPerDegree;
      }
      if (nominalCount < metersPerDegree / 60) {
        suffix = '\u2033'; // seconds
        pointResolution *= 3600;
      } else if (nominalCount < metersPerDegree) {
        suffix = '\u2032'; // minutes
        pointResolution *= 60;
      } else {
        suffix = '\u00b0'; // degrees
      }
    } else if (units === Units.IMPERIAL) {
      if (nominalCount < 0.9144) {
        suffix = 'in';
        pointResolution /= 0.0254;
      } else if (nominalCount < 1609.344) {
        suffix = 'ft';
        pointResolution /= 0.3048;
      } else {
        suffix = 'mi';
        pointResolution /= 1609.344;
      }
    } else if (units === Units.NAUTICAL) {
      pointResolution /= 1852;
      suffix = 'nm';
    } else if (units === Units.METRIC) {
      if (nominalCount < 0.001) {
        suffix = 'μm';
        pointResolution *= 1000000;
      } else if (nominalCount < 1) {
        suffix = 'mm';
        pointResolution *= 1000;
      } else if (nominalCount < 1000) {
        suffix = 'm';
      } else {
        suffix = 'km';
        pointResolution /= 1000;
      }
    } else if (units === Units.US) {
      if (nominalCount < 0.9144) {
        suffix = 'in';
        pointResolution *= 39.37;
      } else if (nominalCount < 1609.344) {
        suffix = 'ft';
        pointResolution /= 0.30480061;
      } else {
        suffix = 'mi';
        pointResolution /= 1609.3472;
      }
    } else if (units === SCALE) {
      const mpu = projection.getMetersPerUnit();
      const DEFAULT_DPI = 25.4 / 0.28;
      const inchesPerMeter = 1000 / 25.4;
      scale =
        parseFloat(viewState.resolution) * mpu * inchesPerMeter * DEFAULT_DPI;
    } else {
      assert(false, 33); // Invalid units
    }

    let i =
      3 * Math.floor(Math.log(this.minWidth_ * pointResolution) / Math.log(10));
    let count, width;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      count =
        LEADING_DIGITS[((i % 3) + 3) % 3] * Math.pow(10, Math.floor(i / 3));
      width = Math.round(count / pointResolution);
      if (isNaN(width)) {
        this.element.style.display = 'none';
        this.renderedVisible_ = false;
        return;
      } else if (width >= this.minWidth_) {
        break;
      }
      ++i;
    }

    let html = count + ' ' + suffix;
    if (units === SCALE) {
      html = '1:' + Math.floor(scale);
    }
    if (this.renderedHTML_ !== html) {
      this.innerElement_.innerHTML = html;
      this.renderedHTML_ = html;
    }

    if (this.renderedWidth_ !== width) {
      this.innerElement_.style.width = width + 'px';
      this.renderedWidth_ = width;
    }

    if (!this.renderedVisible_) {
      this.element.style.display = '';
      this.renderedVisible_ = true;
    }
  }
}
export default ScaleLine;
