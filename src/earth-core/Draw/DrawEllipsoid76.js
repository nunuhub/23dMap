/**
 * @Author han
 * @Date 2020/11/10 15:41
 */

import * as Cesium from 'cesium_shinegis_earth';
import { DrawPolyline } from './DrawPolyline8';
import * as EllipsoidAttr from './EntityAttr/EllipsoidAttr48';
import { EditEllipsoid } from '../Edit/EditEllipsoid49';
import { transformWGS84ToCartesian } from '../Scene/Base';

/**
 * 绘制椭球类
 * @memberOf DrawBase.DrawPolyline
 * @extends DrawBase.DrawPolyline
 */
class DrawEllipsoid extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'ellipsoid';
    this._minPointNum = 2;
    this._maxPointNum = 3;
    this.editClass = EditEllipsoid;
    this.attrClass = EllipsoidAttr;
  }

  /**
   * 获取绘制的坐标数组
   * @param time
   * @returns {[position]}
   */
  getShowPosition() {
    if (this._positions_draw && this._positions_draw.length > 0)
      return this._positions_draw[0];
    return null;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    this._positions_draw = [];

    let that = this;
    let addattr = {
      position: new Cesium.CallbackProperty(function (time) {
        return that.getShowPosition(time);
      }, false),
      ellipsoid: EllipsoidAttr.style2Entity(attribute.style),
      attribute: attribute
    };

    this.entity = this.dataSource.entities.add(addattr); //创建要素对象
    this.entity.mark311 = this.drawTool.id;
    return this.entity;
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    return EllipsoidAttr.style2Entity(style, entity.ellipsoid);
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing(isLoad) {
    if (!this._positions_draw) return;

    if (isLoad) {
      this.addPositionsForRadius(this._positions_draw);
      return;
    }

    if (this._positions_draw.length < 2) return;

    let style = this.entity.attribute.style;

    //半径处理
    let radius = this.formatNum(
      Cesium.Cartesian3.distance(
        this._positions_draw[0],
        this._positions_draw[1]
      ),
      2
    );
    style.extentRadii = radius; //短半轴
    style.heightRadii = radius;

    //长半轴
    let semiMajorAxis;
    if (this._positions_draw.length === 3) {
      semiMajorAxis = this.formatNum(
        Cesium.Cartesian3.distance(
          this._positions_draw[0],
          this._positions_draw[2]
        ),
        2
      );
    } else {
      semiMajorAxis = radius;
    }
    style.widthRadii = semiMajorAxis;

    this.updateRadii(style);
  }

  /**
   * 更新半径
   * @param style {options}
   * @param style.extentRadii {number} 赤道半径x
   * @param style.widthRadii {number} 赤道半径y
   * @param style.heightRadii {number} 极半径
   */
  updateRadii(style) {
    this.entity.ellipsoid.radii.setValue(
      new Cesium.Cartesian3(
        style.extentRadii,
        style.widthRadii,
        style.heightRadii
      )
    );
  }

  /**
   * 增加坐标
   * @param position
   */
  addPositionsForRadius(position) {
    this._positions_draw = [position];

    let style = this.entity.attribute.style;

    //获取椭圆上的坐标点数组
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: position,
        semiMajorAxis: Number(style.extentRadii), //长半轴
        semiMinorAxis: Number(style.widthRadii), //短半轴
        rotation: Cesium.Math.toRadians(Number(style.rotation || 0)),
        granularity: 2.0
      },
      true,
      false
    );

    //长半轴上的坐标点
    let majorPos = new Cesium.Cartesian3(
      cep.positions[0],
      cep.positions[1],
      cep.positions[2]
    );
    this._positions_draw.push(majorPos);

    //短半轴上的坐标点
    let minorPos = new Cesium.Cartesian3(
      cep.positions[3],
      cep.positions[4],
      cep.positions[5]
    );
    this._positions_draw.push(minorPos);
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象
    this.entity._positions_draw = this._positions_draw;
    this.entity.position = this.getShowPosition();
  }

  setDynamicEllipseGraphics(style, model) {
    if (style && style.center) {
      let entity = model,
        _center = style.center,
        _radius = style.radius || 800,
        _rotateAmount = style.rotateAmount || 0.05,
        _stRotation = 0,
        _height = style.height || 1,
        heading = 0,
        pitch = 0,
        roll = 0,
        _scale = style.scale || null,
        _scale2 = style.scale2 || null,
        _material =
          style.material ||
          new Cesium.ImageMaterialProperty({
            image: style.imge || 'Assets3D/Textures/circle_bg.png',
            transparent: true
          });

      entity.position = new Cesium.CallbackProperty(function () {
        return transformWGS84ToCartesian(_center);
      }, false);

      entity.orientation = new Cesium.CallbackProperty(function () {
        return Cesium.Transforms.headingPitchRollQuaternion(
          transformWGS84ToCartesian(_center),
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(heading),
            Cesium.Math.toRadians(pitch),
            Cesium.Math.toRadians(roll)
          )
        );
      }, false);
      let bg_scale = _radius,
        flag = false;
      let updateScalerAxis = () => {
        if (_radius >= _scale || _radius <= bg_scale) {
          flag = !flag;
        }
        flag ? (_radius += 2) : (_radius -= 2);
      };
      let updateScalerAxis2 = () => {
        _scale2 >= _radius ? (_radius += 2) : (_radius = bg_scale);
      };
      entity.ellipse = {
        material: _material,
        height: _height,
        semiMajorAxis: new Cesium.CallbackProperty(function () {
          return _radius;
        }, false),
        semiMinorAxis: new Cesium.CallbackProperty(function () {
          return _radius;
        }, false),
        stRotation: new Cesium.CallbackProperty(function () {
          if (_rotateAmount > 0) {
            _stRotation += _rotateAmount;
            if (_stRotation >= 360) {
              _stRotation = 0;
            }
          }
          if (_scale) updateScalerAxis();
          if (_scale2) updateScalerAxis2();
          return _stRotation;
        }, false)
      };
    }
  }

  //闪烁椭圆
  setDynamicBlinkEllipseGraphics(style, model) {
    if (style && style.position) {
      let entity = model,
        alp = style.alp || 1,
        flog = style.flog || true;
      entity.position = style.position;
      entity.ellipse = {
        semiMinorAxis: style.semiMinorAxis || 2000.0,
        semiMajorAxis: style.semiMajorAxis || 2000.0,
        height: style.height || 10,
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty(function () {
            if (flog) {
              alp = alp - 0.05;
              if (alp <= 0) {
                flog = false; // hide
              }
            } else {
              alp = alp + 0.05;
              if (alp >= 1) {
                flog = true; // show
              }
            }
            return Cesium.Color.RED.withAlpha(alp);
          }, false)
        )
      };
    }
  }
}

export { DrawEllipsoid };
