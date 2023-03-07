import * as Cesium from 'cesium_shinegis_earth';
import * as draggerCtl from '../Edit/Dragger6';
import { centerOfMass, setPositionsHeight } from '../Tool/Point2';
import { message } from '../Tool/ToolTip4';
import { Message } from 'element-ui';
import { lonlats2cartesians } from '../Tool/Util3';
// 开挖压平
class FlattenTools {
  constructor(viewer, dataSource) {
    this.viewer = viewer || {};
    this.dataSource = dataSource || new Cesium.CustomDataSource();
  }

  clipArr(data) {
    // console.log('data', data);
    let checkedLayers = this.viewer.shine.layerManager.checkedLayers;
    let tilesArr = checkedLayers.filter(
      (ele) => ele.type === '3dtiles' || ele.type === 'I3S'
    );
    let layerIds = tilesArr.map((item) => item.id);
    for (const o of tilesArr) {
      let layer = this.viewer.shine.getLayer(o.id, 'id');
      if (layer.provider?.layers[0].data.layerType === 'Building') {
        Message.error('Buiding类型暂时不支持此类服务的开挖压平！');
        /*        await layer.provider.readyPromise;
        if (!layer.model) {
          //Message.error('暂时不支持此类服务的开挖压平！');
          // return;
        }*/
      } else {
        if (!layer.model.flattenPolygons) {
          layer.model.flattenPolygons = new Cesium.FlattenPolygonCollection();
        }
        layer.model.flattenPolygons.removeAll();
      }
    }
    let terrain = this.viewer.scene.globe;
    terrain.flattenPolygons = new Cesium.FlattenPolygonCollection();
    terrain.flattenPolygons.removeAll();
    if (data.length === 0) {
      terrain.flattenPolygons.enabled = false;
    }
    for (let i = 0; i < data.length; i++) {
      let poistion = JSON.parse(data[i].positions);
      let type = data[i].flattenType ? 'clipping' : 'flatten';
      let ploygon = this.getFlattenPolygon(type, poistion);
      let layers = JSON.parse(data[i].layers);
      layers.forEach((element) => {
        if (layerIds.includes(element.id)) {
          let currentLayer = this.viewer.shine.getLayer(element.id, 'id');
          if (currentLayer.model) {
            let eleLayer = currentLayer.model;
            eleLayer.flattenPolygons.add(ploygon);
          } else {
            Message.error('Buiding类型暂时不支持此类服务的开挖压平！');
          }
        }
      });
      let ploygonTerrain = this.getFlattenPolygon(
        data[i].terrainType,
        poistion
      );
      terrain.flattenPolygons.add(ploygonTerrain);
    }
  }

  // 获取flattenPolygon
  getFlattenPolygon(type, positions, height) {
    let result;
    switch (type) {
      case 'clipping':
        result = new Cesium.FlattenPolygon({
          positions: positions,
          mode: Cesium.FlattenMode.CLIPPING
        });
        break;
      case 'flatten':
        var thisHeight =
          height || Cesium.Cartographic.fromCartesian(positions[0]).height;
        result = new Cesium.FlattenPolygon({
          positions: positions,
          height: thisHeight,
          mode: Cesium.FlattenMode.FLATTEN
        });
        break;
      case 'disable':
        var p1 = { ...positions[0] };
        var p2 = { x: p1.x + 10, y: p1.y, z: p1.z };
        var p3 = { x: p1.x, y: p1.y + 10, z: p1.z };
        result = new Cesium.FlattenPolygon({
          positions: [p1, p2, p3],
          height: 0,
          mode: Cesium.FlattenMode.FLATTEN
        });
        break;
    }
    return result;
  }

  // 压平 创建高度拖拽点
  createHeightDragger(entity, height) {
    let that = this;
    let positions = entity.editing._positions_draw;
    // 更新polygon高度
    that.updatePolygonHeight(entity, height);
    entity.editing.newHeightDraggers = [];
    let polyCenter = setPositionsHeight(centerOfMass(positions), height);
    let lastPosition;
    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: polyCenter,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        // console.log('====position', position)
        lastPosition = lastPosition ? lastPosition : position;
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let chaHeight =
          thisHeight - Cesium.Cartographic.fromCartesian(lastPosition).height;
        // dragger.callback && dragger.callback(that.editIndex, thisHeight + chaHeight)
        that.updatePolygonHeight(entity, thisHeight + chaHeight);
        lastPosition = position;
      },
      onDragEnd: function onDrag(/* dragger, position */) {
        lastPosition = null;
      }
    });
    entity.editing.newHeightDraggers.push(dragger);
  }

  updatePolygonHeight(entity, _height) {
    let positions = entity.editing._positions_draw;
    let height = _height;
    if (height == 0 && entity) {
      height = Cesium.Cartographic.fromCartesian(
        entity._positions_draw[0]
      ).height;
    }
    if (!positions || positions.length == 0) return;
    // 更新拖拽点高度
    let polygonDraggers = entity.editing.draggers.filter(
      (item) => item._pointType == 1 || item._pointType == 2
    );
    for (let j = 0; j < polygonDraggers.length; j++) {
      let belowDragger = polygonDraggers[j];
      let _position = setPositionsHeight(
        belowDragger.position.getValue(),
        height
      );
      belowDragger.position.setValue(_position);
    }
    // 更新_positions_draw
    let newPositions = [];
    for (let i = 0; i < positions.length; i++) {
      let _position = setPositionsHeight(positions[i], height);
      newPositions.push(_position);
    }
    entity.editing._positions_draw = newPositions;
    entity._positions_draw = newPositions;
    entity.editing.setPositions(newPositions);
    entity.editing.updateDraggers();
  }

  // 开挖压平
  toClip(tilesets, _psC3, type, height) {
    let psC3;
    if (_psC3[0].z) {
      psC3 = _psC3;
    } else {
      psC3 = lonlats2cartesians(_psC3);
    }
    if (tilesets instanceof Array) {
      for (let n = 0; n < tilesets.length; n++) {
        let tileset = tilesets[n];
        if (!tileset.flattenPolygons) {
          tileset.flattenPolygons = new Cesium.FlattenPolygonCollection();
        }
        let a = this.getFlattenPolygon(type, psC3, height);
        tileset.flattenPolygons.add(a);
      }
    } else {
      let tileset = tilesets;
      if (!tileset.flattenPolygons) {
        tileset.flattenPolygons = new Cesium.FlattenPolygonCollection();
      }
      let a = this.getFlattenPolygon(type, psC3, height);
      tileset.flattenPolygons.add(a);
    }
  }
  // 地形裁切
  terrainClip(_psC3, type, height) {
    let psC3;
    if (_psC3[0].z) {
      psC3 = _psC3;
    } else {
      psC3 = lonlats2cartesians(_psC3);
    }
    let terrain = this.viewer.scene.globe;
    let a = this.getFlattenPolygon(type, psC3, height);
    if (!terrain.flattenPolygons) {
      terrain.flattenPolygons = new Cesium.FlattenPolygonCollection();
    }
    terrain.flattenPolygons.enabled = true;
    terrain.flattenPolygons.add(a);
  }
  // 地形裁切清除
  deleteIndexTerrain(index) {
    let terrain = this.viewer.scene.globe;
    if (!terrain.flattenPolygons) {
      terrain.flattenPolygons = new Cesium.FlattenPolygonCollection();
    }
    let flattenPolygon = terrain.flattenPolygons.get(index);
    terrain.flattenPolygons.remove(flattenPolygon);
  }
  // 地形裁切清除
  deleteAllTerrain() {
    let terrain = this.viewer.scene.globe;
    if (!terrain.flattenPolygons) {
      terrain.flattenPolygons = new Cesium.FlattenPolygonCollection();
    }
    terrain.flattenPolygons.removeAll();
    terrain.flattenPolygons.enabled = false;
  }

  // 定位
  centerAt(positions) {
    let boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
    this.viewer.camera.flyToBoundingSphere(boundingSphere);
  }

  // 清除所有
  deleteAll(tilesets) {
    if (tilesets instanceof Array) {
      for (let i = 0; i < tilesets.length; i++) {
        let flattenPolygons = tilesets[i].flattenPolygons;
        if (flattenPolygons) {
          flattenPolygons.removeAll();
        }
      }
    } else {
      let flattenPolygons = tilesets.flattenPolygons;
      if (flattenPolygons) {
        flattenPolygons.removeAll();
      }
    }
  }
  // 删除
  deleteFlattenPolygon(tilesets, index) {
    if (tilesets instanceof Array) {
      for (let i = 0; i < tilesets.length; i++) {
        let flattenPolygons = tilesets[i].flattenPolygons;
        let flattenPolygon = flattenPolygons.get(index);
        flattenPolygon.equals = function (left, right) {
          return (
            left.flattenMode === right.flattenMode &&
            left.geometry === right.geometry
          );
        };
        flattenPolygons.remove(flattenPolygon);
      }
    } else {
      let flattenPolygons = tilesets.flattenPolygons;
      let flattenPolygon = flattenPolygons.get(index);
      flattenPolygon.equals = function (left, right) {
        return (
          left.flattenMode === right.flattenMode &&
          left.geometry === right.geometry
        );
      };
      flattenPolygons.remove(flattenPolygon);
    }
  }
}
export { FlattenTools };
