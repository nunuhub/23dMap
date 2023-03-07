/*
 * @Author: liujh
 * @Date: 2020/9/14 15:18
 * @Description:
 */
/* 57 */
/***/
import * as Cesium from 'cesium_shinegis_earth';
import { Class } from './Tool/Class13';
// import * as Widget from './Widget/WidgetManager33'
// import {BaseWidget} from './Widget/BaseWidget60'
import * as Map from './Map61';
import { ViewerEx } from './ViewerEx';
import { Layer } from './Layer26';
import * as PointConvert from './Tool/PointConvert25';
import * as Util from './Tool/Util1';
import * as Handle from './Tool/Handler108';
import * as Tileset from './Layer/Tileset55';
import * as Matrix from './Tool/Matrix56';
import * as Point from './Tool/Point2';
// import { FlowEcharts } from './ThirdParty/FlowEcharts98'
import { MapVLayer } from './ThirdParty/MapVLayer100';
import { Draw } from './Draw/DrawAll21';
import * as AttrAll from './Draw/EntityAttr/AttrAll53';
import * as EventType from './Tool/EventType7';
import * as ToolTip from './Tool/ToolTip4';
import * as DrawUtil from './Tool/Util3';
import * as DraggerCtl from './Edit/Dragger6';

import { DivPoint } from './Tool/DivPoint105';
import { CircleFadeMaterial } from './Scene/CircleFadeMaterial36';
import { LineFlowMaterial } from './Scene/LineFlowMaterial28';
//import * as LeafLet from './ThirdParty/LeafLet20'
import * as LeafLet from 'leaflet';
//import * as EsriLeafLet from './ThirdParty/EsriLeafLet32'
import * as EsriLeafLet from 'esri-leaflet';
import { ArcFeatureLayer } from './Layer/ArcFeatureLayer106';
import { ArcFeatureGridLayer } from './Layer/ArcFeatureGridLayer107';
import {
  EditPoint,
  EditCircle,
  EditCurve,
  EditPolylineVolume,
  EditCorridor,
  EditRectangle,
  EditPolygon,
  EditWall,
  EditEllipsoid,
  EditCylinder,
  EditPModel,
  EditBase,
  EditPolyline,
  EditPolygonEx
} from './Edit';
import { Measure } from './Measure/Measure104';
import OLCesium from './ThirdParty/shinegis-olcesium/OLCesium';
//===========框架基本信息=========
let name = '';
let version = '';
let update = '';
let author = '';
let website = '';

let draw = {};
draw.register = Draw.register;
draw.util = DrawUtil;
draw.event = EventType;
draw.tooltip = ToolTip.message;
draw.dragger = DraggerCtl;
draw.attr = AttrAll;

let DrawEdit = {
  Base: EditBase,
  Circle: EditCircle,
  Corridor: EditCorridor,
  Curve: EditCurve,
  Ellipsoid: EditEllipsoid,
  Point: EditPoint,
  Polygon: EditPolygon,
  PolygonEx: EditPolygonEx,
  Polyline: EditPolyline,
  PolylineVolume: EditPolylineVolume,
  Rectangle: EditRectangle,
  Wall: EditWall,
  PModel: EditPModel,
  Cylinder: EditCylinder
};

let L = LeafLet;
L.esri = EsriLeafLet;

//一次加载，不分网格

Layer.ArcFeatureLayer = ArcFeatureLayer;
//注册到exports内部图层管理中：
Layer.regLayerForConfig('arcgis_feature2', ArcFeatureLayer);

//分网格加载

Layer.ArcFeatureGridLayer = ArcFeatureGridLayer;
//注册到exports内部图层管理中：
Layer.regLayerForConfig('arcgis_feature', ArcFeatureGridLayer);
//Layer.regLayerForConfig("feature", ArcFeatureGridLayer);
//Layer.regLayerForConfig("feature-pbf", ArcFeatureGridLayer);

//=====================兼容历史版本=====================
let AnimationLineMaterialProperty = LineFlowMaterial;
let ElliposidFadeMaterialProperty = CircleFadeMaterial;
let latlng = Point;

export {
  name,
  version,
  update,
  author,
  website,
  Cesium,
  Class,
  // Widget,
  Map,
  ViewerEx,
  Layer,
  DrawEdit,
  PointConvert,
  Util,
  Tileset,
  Handle,
  Matrix,
  Point,
  // FlowEcharts,
  MapVLayer,
  Draw,
  draw,
  Measure,
  DivPoint,
  CircleFadeMaterial,
  LineFlowMaterial,
  L,
  AnimationLineMaterialProperty,
  ElliposidFadeMaterialProperty,
  latlng,
  OLCesium
};
