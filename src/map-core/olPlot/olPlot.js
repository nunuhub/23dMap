import './scss/index.css';
import PlotDraw from './core/PlotDraw';
import PlotEdit from './core/PlotEdit';
import PlotUtils from './core/PlotUtils';
import * as PlotTypes from './Utils/PlotTypes';
import * as Geometry from './Geometry';
class olPlot {
  constructor(map, options) {
    this.PlotTypes = PlotTypes;
    this.Geometry = Geometry;
    this.plotDraw = new PlotDraw(map, options);
    this.plotEdit = new PlotEdit(map, options);
    this.plotUtils = new PlotUtils(map, options);
  }
}

export default olPlot;
