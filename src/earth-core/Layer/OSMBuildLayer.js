/*
 * @Author: chenlj4
 * @Date: 2020/12/3 11:15
 * @Description:
 */
/* 110 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { Tiles3dLayer } from './Tiles3dLayer90';

// class OSMBuildLayer_es6 extends Tiles3dLayer {
//   constructor(item, viewer) {
//     super(item, viewer);

//     this.model = null;
//     this.originalCenter = null;
//     this.positionCenter = null;
//   }

//   //添加
//   add() {
//     if (!this.model && !this.viewer.scene.primitives.contains(this.model)) {
//       let osmbuildings = Cesium.createOsmBuildings();
//       if (osmbuildings) {
//         this.model = this.viewer.scene.primitives.add(osmbuildings);
//       }
//       /*             样式部分待统一样式方法再定
//                         if (this.config.style) {
//                           this.model.style = new Cesium.Cesium3DTileStyle(this.config.style)
//                       } */
//       /*  样式部分待统一样式方法再定
//               viewer.scene.primitives.add(Cesium.createOsmBuildings({
//               style: new Cesium.Cesium3DTileStyle({
//                 color: {
//                   conditions: [
//                     ["${feature["building"]} === "hospital"", "color("#0000FF")"],
//                     ["${feature["building"]} === "school"", "color("#00FF00")"],
//                     [true, "color("#ffffff")"]
//                   ]
//                 }
//               })
//             })) */
//     }
//   }

//   //移除
//   remove() {
//     if (this.viewer.scene.primitives.contains(this.model))
//       this.viewer.scene.primitives.remove(this.model);
//     delete this.model;
//   }
// }

const OSMBuildLayer = Tiles3dLayer.extend({
  model: null,
  originalCenter: null,
  positionCenter: null,
  //添加
  add: function add() {
    if (!this.model && !this.viewer.scene.primitives.contains(this.model)) {
      let osmbuildings = Cesium.createOsmBuildings();
      if (osmbuildings) {
        this.model = this.viewer.scene.primitives.add(osmbuildings);
      }
      /*             样式部分待统一样式方法再定
                        if (this.config.style) {
                          this.model.style = new Cesium.Cesium3DTileStyle(this.config.style)
                      } */
      /*  样式部分待统一样式方法再定
              viewer.scene.primitives.add(Cesium.createOsmBuildings({
              style: new Cesium.Cesium3DTileStyle({
                color: {
                  conditions: [
                    ["${feature["building"]} === "hospital"", "color("#0000FF")"],
                    ["${feature["building"]} === "school"", "color("#00FF00")"],
                    [true, "color("#ffffff")"]
                  ]
                }
              })
            })) */
    }
  },
  //移除
  remove: function remove() {
    if (this.viewer.scene.primitives.contains(this.model))
      this.viewer.scene.primitives.remove(this.model);
    delete this.model;
  }
});
export { OSMBuildLayer };
