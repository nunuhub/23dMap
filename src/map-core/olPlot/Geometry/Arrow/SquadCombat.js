/**
 * Created by FDD on 2017/5/26.
 * @desc 分队战斗行动
 * @Inherits AttackArrow
 */

import { SQUAD_COMBAT } from '../../Utils/PlotTypes';
import AttackArrow from './AttackArrow';
import * as PlotUtils from '../../Utils/utils';
import * as Constants from '../../Constants';
import * as ArrowTypes from './ArrowTypes';

class SquadCombat extends AttackArrow {
  constructor(coordinates, points, params) {
    super(coordinates, points, params);
    this.type = SQUAD_COMBAT;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.arrowType = ArrowTypes.RIGHT;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
    }
  }

  /**
   * 执行动作
   */
  generate() {
    try {
      const count = this.getPointCount();
      if (count < 2) {
        return false;
      } else {
        const pnts = this.getPoints();
        const tailPnts = this.getTailPoints(pnts);
        const headPnts = this.getArrowHeadPoints(
          pnts,
          tailPnts[0],
          tailPnts[1]
        );
        const neckLeft = headPnts[0];
        const neckRight = headPnts[4];
        // console.log(tailPnts)
        const [tailLeft, tailRight] = [tailPnts[0], tailPnts[1]];
        if (
          Math.abs(tailLeft[0] - tailRight[0]) >
          Math.abs(tailLeft[1] - tailRight[1])
        ) {
          if (pnts[1][1] - tailLeft[1] > 0) {
            this.arrowType = ArrowTypes.TOP;
          } else {
            this.arrowType = ArrowTypes.BOTTOM;
          }
        } else {
          if (pnts[1][0] - tailLeft[0] > 0) {
            this.arrowType = ArrowTypes.RIGHT;
          } else {
            this.arrowType = ArrowTypes.LEFT;
          }
        }
        // console.log(this.arrowType)
        const bodyPnts = this.getArrowBodyPoints(
          pnts,
          neckLeft,
          neckRight,
          this.tailWidthFactor
        );
        const count = bodyPnts.length;
        let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        let rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = PlotUtils.getQBSplinePoints(rightPnts);
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
      }
    } catch (e) {
      console.log(e);
    }
  }

  getTailPoints(points) {
    const allLen = PlotUtils.getBaseLength(points);
    const tailWidth = allLen * this.tailWidthFactor;
    const tailLeft = PlotUtils.getThirdPoint(
      points[1],
      points[0],
      Constants.HALF_PI,
      tailWidth,
      false
    );
    const tailRight = PlotUtils.getThirdPoint(
      points[1],
      points[0],
      Constants.HALF_PI,
      tailWidth,
      true
    );
    return [tailLeft, tailRight];
  }
}

export default SquadCombat;
