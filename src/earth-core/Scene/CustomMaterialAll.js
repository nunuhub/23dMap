/*
 * @Author: liujh
 * @Date: 2020/9/18 16:46
 * @Description:
 */
/* 11 */ ///public function
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { CircleFadeMaterial } from './CircleFadeMaterial36';
import { CircleWaveMaterialProperty } from './CircleWaveMaterialProperty';
import { WallLinkCustomMaterialProperty } from './WallLinkCustomMaterialProperty';
import { LineFlowMaterial } from './LineFlowMaterial28';
import { PolylineCityLinkMaterialProperty } from './PolylineCityLinkMaterialProperty';

export function setFillMaterial(entityattr, style) {
  if (style.material) {
    //material属性优先
    entityattr.material = style.material;
    return entityattr;
  }

  if (style.color || style.fillType) {
    let color = new Cesium.Color.fromCssColorString(
      Cesium.defaultValue(style.color, '#FFFF00')
    ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0)));

    switch (
      style.fillType ||
      style.lineType //线的材质也会经过这
    ) {
      default:
      case 'color':
        //纯色填充
        entityattr.material = color;
        break;
      case 'grid': {
        //网格
        let lineCount = Cesium.defaultValue(style.grid_lineCount, 8);
        let lineThickness = Cesium.defaultValue(style.grid_lineThickness, 2.0);
        entityattr.material = new Cesium.GridMaterialProperty({
          color: color,
          cellAlpha: Cesium.defaultValue(style.grid_cellAlpha, 0.1),
          lineCount: new Cesium.Cartesian2(lineCount, lineCount),
          lineThickness: new Cesium.Cartesian2(lineThickness, lineThickness)
        });
        break;
      }
      case 'checkerboard': {
        //棋盘
        let repeat = Cesium.defaultValue(style.checkerboard_repeat, 4);
        entityattr.material = new Cesium.CheckerboardMaterialProperty({
          evenColor: color,
          oddColor: new Cesium.Color.fromCssColorString(
            style.oddColor || '#ffffff'
          ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0))),
          repeat: new Cesium.Cartesian2(repeat, repeat)
        });
        break;
      }
      case 'stripe':
        // 条纹
        entityattr.material = new Cesium.StripeMaterialProperty({
          evenColor: color,
          oddColor: new Cesium.Color.fromCssColorString(
            style.oddColor || '#ffffff'
          ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0))),
          repeat: Cesium.defaultValue(style.stripe_repeat, 6)
        });
        break;
      case 'breathGradualWall': //原生
        //呼吸渐变墙
        // eslint-disable-next-line no-case-declarations
        let alp = 1,
          num = 40,
          breathColor = new Cesium.Color.fromCssColorString(
            style.color || '#FFFF00'
          ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0))),
          speed = style.speed || 3; //(0,10)
        speed /= 200; //(0,0.04)

        entityattr.material = new Cesium.ImageMaterialProperty({
          image: 'Assets3D/Textures/fence.png',
          transparent: true,
          color: new Cesium.CallbackProperty(function () {
            if (num % 2 === 0) {
              alp -= speed;
            } else {
              alp += speed;
            }

            if (alp <= 0.1) {
              num++;
            } else if (alp >= 1) {
              num++;
            }
            return breathColor.withAlpha(alp);
          }, false)
        });
        break;
      case 'dynamicGradualWall':
        //动态渐变墙
        // eslint-disable-next-line no-case-declarations
        let duration = style.duration||7;
        //设定duration用户端范围1~10
        duration = (5 - duration / 2 + 1) * 1000;
        entityattr.material = new WallLinkCustomMaterialProperty({
          image: style.materialImgUrl || 'Assets3D/Textures/jsx2.png',
          //freely: 'vertical',
          freely: style.freely||'horizontal',
          direction: '+',
          count: style.count,
          materialColor: new Cesium.Color.fromCssColorString(
            style.color || '#36ff76'
          ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0))),
          duration
        });
        break;
      case 'animationCircle':
        //动态圆
        // eslint-disable-next-line no-case-declarations
        let s;
        s = style.speed ?? 1;
        s = (22 - 2 * s) * 100;
        (s = Math.min(s, 2000)), (s = Math.max(s, 100));

        entityattr.material = new CircleFadeMaterial({
          duration: s, 
          color: new Cesium.Color.fromCssColorString(
            style.color || '#FFFF00'
          ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0)))
          //gradient: Cesium.defaultValue(style.animationGradient, 0),
          //count: Cesium.defaultValue(style.animationCount, 1)
        });
        break;
      case 'circleWave':
        //动态波纹椭圆
        {
        let s; 
        s = style.speed ?? 1;
        s = (10-s) * 100;
        (s = Math.min(s, 2000)), (s = Math.max(s, 100));
        entityattr.material = new CircleWaveMaterialProperty({
          materialColor: new Cesium.Color.fromCssColorString(
            style.color || '#FFFF00'
          ).withAlpha(
            Number(style.opacity ?? 1.0)
          ),
          duration: s,
          count: 3,
          gradient: 0.8
        });}
        break;
      case 'zoomCircle':
        //缩放旋转的纹理圆
        entityattr.material = new Cesium.ImageMaterialProperty({
          image: style.imge || 'Assets3D/Textures/circle_bg.png',
          transparent: true
        });
        break;
      case 'image':
        entityattr.material = new Cesium.ImageMaterialProperty({
          image: style.image || 'Assets3D/img/mark4.png',
          color: new Cesium.Color.fromCssColorString('#FFFFFF').withAlpha(
            Number(style.opacity ?? 1.0)
          ),
          repeat: new Cesium.Cartesian2(
            style.repeatX || 1.0,
            style.repeatY || 1.0
          )
        });
        break;
        case'text':
        let text = Cesium.defaultValue(style.text,'文字')
        let font_size = Cesium.defaultValue(style.font_size,100)
        let textColor = Cesium.defaultValue(style.color,'#FFFF00')
        let font_family = Cesium.defaultValue(style.font_family,'黑体')
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        ctx.font = font_size + "px " +font_family;
        ctx.textAlign = 'center'
        let wid = ctx.measureText(text).width ;
        let hei = font_size;
        canvas.width = wid*1.2||10;
        canvas.height = hei*1.45;
        ctx.fillStyle = textColor
        ctx.textBaseline='middle'
        ctx.font = font_size + "px "+font_family;//会被measureText重置
        ctx.fillText(text,(canvas.width - wid)*2/5 , canvas.height*6/11);
        entityattr.material = new Cesium.ImageMaterialProperty({
          image: canvas
        });
        break
        case 'animation': {
        // eslint-disable-next-line no-case-declarations //流动线
        let s;
        s = style.animationSpeed ?? 1;
        s = (22 - 2 * s) * 100;
        (s = Math.min(s, 2000)), (s = Math.max(s, 100));
        entityattr.material = new LineFlowMaterial({
          //动画线材质
          color: color,
          duration: s, //时长，控制速度
          url: style.animationImage || 'Assets3D/Textures/lineClr.png', //图片
          repeat: new Cesium.Cartesian2(
            style.animationRepeatX || 1,
            style.animationRepeatY || 1
          ),
          axisY: style.animationAxisY
        });
        break;
      }
      case 'polylineCityLink':
        //城市流动道路
        // eslint-disable-next-line no-case-declarations
        let sp;
        sp = style.trailSpeed ?? 5;
        sp = (22 - 2 * sp) * 100;
        (sp = Math.min(sp, 2000)), (sp = Math.max(sp, 100));
        entityattr.material = new PolylineCityLinkMaterialProperty({
          materialImgUrl: style.materialImgUrl,
          materialColor: new Cesium.Color.fromCssColorString(
            style.color || '#FFFF00'
          ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0))),
          duration: sp
        });
        break;
    }
  }

  //如果未设置任何material，默认设置随机颜色
  if (entityattr.material == null || style.randomColor) {
    entityattr.material = Cesium.Color.fromRandom({
      minimumRed: Cesium.defaultValue(style.minimumRed, 0.0),
      maximumRed: Cesium.defaultValue(style.maximumRed, 0.75),
      minimumGreen: Cesium.defaultValue(style.minimumGreen, 0.0),
      maximumGreen: Cesium.defaultValue(style.maximumGreen, 0.75),
      minimumBlue: Cesium.defaultValue(style.minimumBlue, 0.0),
      maximumBlue: Cesium.defaultValue(style.maximumBlue, 0.75),
      alpha: Cesium.defaultValue(style.opacity, 1.0)
    });
  }

  return entityattr;
} //通用处理方法
