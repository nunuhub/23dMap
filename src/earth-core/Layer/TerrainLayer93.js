/*
 * @Author: liujh
 * @Date: 2020/8/24 9:47
 * @Description:
 */
/* 93 */
/***/

import { BaseLayer } from './BaseLayer10';
import * as util from '../Tool/Util1';

/*class TerrainLayer_es6 extends BaseLayer {
    constructor(item, viewer) {
        super(item, viewer)

        this.terrain = null
    }

    add() {
        if (!this.terrain) {
            this.terrain = util.getTerrainProvider(this.config)
        }
        this.viewer.terrainProvider = this.terrain
    }

    //移除
    remove() {
        this.viewer.terrainProvider = util.getEllipsoidTerrain()
    }
}*/

const TerrainLayer = BaseLayer.extend({
  terrain: null,
  //添加
  add: function add() {
    if (!this.terrain) {
      this.terrain = util.getTerrainProvider(this.config);
    }
    this.viewer.terrainProvider = this.terrain;
  },
  //移除
  remove: function remove() {
    this.viewer.terrainProvider = util.getEllipsoidTerrain();
  }
});
export { TerrainLayer };
