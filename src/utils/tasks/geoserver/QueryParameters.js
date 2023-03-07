/**
 * Query查询参数类
 * @class QueryParameters
 * @constructor
 * @param {ol.Map} map
 * @param {string} where 查询的where子句
 * @param {string} [srsName] SRS名称。如果未提供，则不会在几何上设置srsName属性。
 * @param {string} [handle] Handle. 目前未使用
 * @param {string} [outputFormat] 输出格式
 * @param {number} [maxFeatures] 要获取的最大要素数
 * @param {Array<string>} [propertyNames] 可选属性名称,暂不支持
 * @param {number} [startIndex] 开始位置索引以用于结果分页
 * @param {string} [resultType] 返回数据类型,
 * E.g. `hits` 只包含响应中的numberOfFeatures属性而没有任何features
 */
class QueryParameters {
  constructor() {
    this.where = undefined;
    this.srsName = undefined;
    this.outputFormat = 'application/json';
    this.maxFeatures = undefined;
    this.startIndex = undefined;
    this.resultType = undefined;
  }
}

export default QueryParameters;
