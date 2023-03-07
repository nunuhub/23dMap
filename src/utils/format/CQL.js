import * as Filter from 'ol/format/filter';
import { WKT } from 'ol/format';
import Geometry from 'ol/geom/Geometry';

export default class CQL {
  constructor() {
    this.inPatterns = / (IN) /i;
    this.tokens = ['PROPERTY', 'COMPARISON', 'VALUE', 'LOGICAL'];
    this.patterns = {
      PROPERTY: /^[_a-zA-Z]\w*/,
      COMPARISON: /^(=|<>|<=|<|>=|>|LIKE)/i,
      IS_NULL: /^IS NULL/i,
      COMMA: /^,/,
      LOGICAL: /^(AND|OR)/i,
      VALUE: /^('([^']|'')*'|-?\d+(\.\d*)?|\.\d+)/,
      LPAREN: /^\(/,
      RPAREN: /^\)/,
      SPATIAL: /^(BBOX|INTERSECTS|DWITHIN|WITHIN|CONTAINS)/i,
      NOT: /^NOT/i,
      BETWEEN: /^BETWEEN/i,
      GEOMETRY: function (text) {
        let type =
          /^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)/.exec(
            text
          );
        if (type) {
          let len = text.length;
          let idx = text.indexOf('(', type[0].length);
          if (idx > -1) {
            let depth = 1;
            while (idx < len && depth > 0) {
              idx++;
              switch (text.charAt(idx)) {
                case '(':
                  depth++;
                  break;
                case ')':
                  depth--;
                  break;
                default:
                // in default case, do nothing
              }
            }
          }
          return [text.substring(0, idx + 1)];
        }
      },
      END: /^$/
    };
    this.follows = {
      LPAREN: ['GEOMETRY', 'SPATIAL', 'PROPERTY', 'VALUE', 'LPAREN'],
      RPAREN: ['NOT', 'LOGICAL', 'END', 'RPAREN'],
      PROPERTY: ['COMPARISON', 'BETWEEN', 'COMMA', 'IS_NULL'],
      BETWEEN: ['VALUE'],
      IS_NULL: ['END'],
      COMPARISON: ['VALUE'],
      COMMA: ['GEOMETRY', 'VALUE', 'PROPERTY'],
      VALUE: ['LOGICAL', 'COMMA', 'RPAREN', 'END'],
      SPATIAL: ['LPAREN'],
      LOGICAL: ['NOT', 'VALUE', 'SPATIAL', 'PROPERTY', 'LPAREN'],
      NOT: ['PROPERTY', 'LPAREN'],
      GEOMETRY: ['COMMA', 'RPAREN']
    };
    this.operators = {
      '=': Filter.equalTo,
      '<>': Filter.notEqualTo,
      '<': Filter.lessThan,
      '<=': Filter.lessThanOrEqualTo,
      '>': Filter.greaterThan,
      '>=': Filter.greaterThanOrEqualTo,
      LIKE: Filter.like,
      BETWEEN: Filter.between,
      'IS NULL': Filter.isNull
    };
    this.operators = {
      '=': Filter.equalTo,
      '<>': Filter.notEqualTo,
      '<': Filter.lessThan,
      '<=': Filter.lessThanOrEqualTo,
      '>': Filter.greaterThan,
      '>=': Filter.greaterThanOrEqualTo,
      LIKE: Filter.like,
      BETWEEN: Filter.between,
      'IS NULL': Filter.isNull
    };
    this.operatorReverse = {
      PropertyIsEqualTo: '=',
      PropertyIsNotEqualTo: '<>',
      PropertyIsLessThan: '<',
      PropertyIsLessThanOrEqualTo: '<=',
      PropertyIsGreaterThan: '>',
      PropertyIsGreaterThanOrEqualTo: '>=',
      PropertyIsLike: 'LIKE',
      PropertyIsNull: 'IS NULL',
      PropertyIsBetween: 'BETWEEN'
    };
    this.logicals = {
      AND: Filter.and,
      OR: Filter.or
    };
    this.precedence = {
      RPAREN: 3,
      LOGICAL: 2,
      COMPARISON: 1
    };
  }

  tryToken(text, pattern) {
    if (pattern instanceof RegExp) {
      return pattern.exec(text);
    } else {
      return pattern(text);
    }
  }

  nextToken(text, tokens) {
    let i,
      token,
      len = tokens.length;
    for (i = 0; i < len; i++) {
      token = tokens[i];
      let pat = this.patterns[token];
      let matches = this.tryToken(text, pat);
      if (matches) {
        let match = matches[0];
        let remainder = text.substring(match.length).replace(/^\s*/, '');
        return {
          type: token,
          text: match,
          remainder: remainder
        };
      }
    }

    let msg = 'ERROR: In parsing: [' + text + '], expected one of: ';
    for (i = 0; i < len; i++) {
      token = tokens[i];
      msg += '\n    ' + token + ': ' + this.patterns[token];
    }

    throw new Error(msg);
  }
  // string 转化为正则规则的对象数组
  tokenize(text) {
    text = text.replaceAll('[', '').replaceAll(']', '');
    //粗糙的处理单个in的语句 in和别的复合无法处理会报错
    let inToken = this.tryToken(text, this.inPatterns);
    if (inToken) {
      text = this.parseInToOr(text, inToken);
    }
    let results = [];
    let token,
      expect = ['NOT', 'GEOMETRY', 'SPATIAL', 'PROPERTY', 'LPAREN'];

    do {
      token = this.nextToken(text, expect);
      text = token.remainder;
      expect = this.follows[token.type];
      if (token.type !== 'END' && !expect) {
        throw new Error('No follows list for ' + token.type);
      }
      results.push(token);
    } while (token.type !== 'END');

    return results;
  }

  //in语句转化为or语句
  parseInToOr(text, inToken) {
    let valueStringMatches = this.tryToken(text, /\((.+?)\)/g);
    if (valueStringMatches) {
      let leftStr = text.substring(0, inToken.index);
      let valueString = valueStringMatches[1];
      let valueArray = valueString.replaceAll(' ', '').split(',');
      let filed = '';
      let beforeFiledString = '';
      if (leftStr.indexOf(' ') > -1) {
        let lastIndex = leftStr.lastIndexOf(' ');
        beforeFiledString = leftStr.substring(0, lastIndex + 1);
        filed = leftStr.substring(lastIndex + 1, leftStr.length);
      } else {
        filed = leftStr;
      }
      let result = beforeFiledString;
      for (let i = 0; i < valueArray.length; i++) {
        let value = valueArray[i];
        result += filed + '=' + value;
        if (i < valueArray.length - 1) {
          result += ' or ';
        }
      }
      return result;
    }
    return text;
  }

  buildAst(tokens) {
    let self = this;
    let operatorStack = [],
      postfix = [];

    // 正则结果排序：LOGICAL类型提前, postfix为排序后的结果
    while (tokens.length) {
      let tok = tokens.shift();
      switch (tok.type) {
        case 'PROPERTY':
        case 'GEOMETRY':
        case 'VALUE':
          postfix.push(tok);
          break;
        case 'COMPARISON':
        case 'BETWEEN':
        case 'IS_NULL':
        case 'LOGICAL': {
          let p = this.precedence[tok.type];

          while (
            operatorStack.length > 0 &&
            this.precedence[operatorStack[operatorStack.length - 1].type] <= p
          ) {
            postfix.push(operatorStack.pop());
          }

          operatorStack.push(tok);
          break;
        }
        case 'SPATIAL':
        case 'NOT':
        case 'LPAREN':
          operatorStack.push(tok);
          break;
        case 'RPAREN':
          while (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1].type !== 'LPAREN'
          ) {
            postfix.push(operatorStack.pop());
          }
          operatorStack.pop(); // toss out the LPAREN

          if (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1].type === 'SPATIAL'
          ) {
            postfix.push(operatorStack.pop());
          }
          break;
        case 'COMMA':
        case 'END':
          break;
        default:
          throw new Error('Unknown token type ' + tok.type);
      }
    }

    while (operatorStack.length > 0) {
      postfix.push(operatorStack.pop());
    }

    function buildTree() {
      let value, property;
      let tok = postfix.pop();
      switch (tok.type) {
        case 'LOGICAL': {
          let rhs = buildTree(),
            lhs = buildTree();
          return new self.logicals[tok.text.toUpperCase()](lhs, rhs);
        }
        case 'NOT': {
          let operand = buildTree();
          return new Filter.not(operand);
        }
        case 'BETWEEN': {
          let min, max;
          postfix.pop();
          max = buildTree();
          min = buildTree();
          property = buildTree();
          return new Filter.between(property, min, max);
        }
        case 'COMPARISON': {
          value = buildTree();
          property = buildTree();
          return new self.operators[tok.text.toUpperCase()](property, value);
        }
        case 'IS_NULL':
          property = buildTree();
          return new self.operators[tok.text.toUpperCase()](property);
        case 'VALUE': {
          let match = tok.text.match(/^'(.*)'$/);
          if (match) {
            return match[1].replace(/''/g, "'");
          } else {
            return Number(tok.text);
          }
        }
        case 'SPATIAL':
          switch (tok.text.toUpperCase()) {
            case 'BBOX': {
              let maxy = buildTree(),
                maxx = buildTree(),
                miny = buildTree(),
                minx = buildTree(),
                prop = buildTree();

              return new Filter.bbox(prop, [minx, miny, maxx, maxy]);
            }
            case 'INTERSECTS':
              value = buildTree();
              property = buildTree();
              return new Filter.intersects(property, value);
            case 'WITHIN':
              value = buildTree();
              property = buildTree();
              return new Filter.within(property, value);
            case 'CONTAINS':
              value = buildTree();
              property = buildTree();
              return new Filter.contains(property, value);
          }
          break;
        case 'GEOMETRY':
          return new WKT().readGeometry(tok.text, {});
        default:
          return tok.text;
      }
    }

    // 解析正则结果为ol.filter
    let result = buildTree();
    if (postfix.length > 0) {
      let msg = '剩余的节点无法解析: \n';
      for (let i = postfix.length - 1; i >= 0; i--) {
        msg += postfix[i].type + ': ' + postfix[i].text + '\n';
      }
      throw new Error(msg);
    }

    return result;
  }

  /**
   * CQL TO FILTER.
   */
  read(text) {
    try {
      return this.buildAst(this.tokenize(text));
    } catch (e) {
      console.warn('CQL解析失败:' + text);
      console.warn(e);
    }
  }

  /**
   * FILTER TO CQL.
   */
  write(filter) {
    switch (filter.tagName_) {
      case 'BBOX':
        return (
          'BBOX(' +
          filter.geometryName +
          ',' +
          filter.extent.join(',') +
          ',' +
          filter.srsName +
          ')'
        );
      case 'Within':
        return (
          'WITHIN(' +
          filter.geometryName +
          ', ' +
          this.readGeometry(filter.geometry) +
          ')'
        );
      case 'Intersects':
        return (
          'INTERSECTS(' +
          filter.geometryName +
          ', ' +
          this.readGeometry(filter.geometry) +
          ')'
        );
      case 'Contains':
        return (
          'CONTAINS(' +
          filter.geometryName +
          ', ' +
          this.readGeometry(filter.geometry) +
          ')'
        );
      case 'Not':
        return 'NOT (' + this.write(filter.condition) + ')';
      // TODO: deal with precedence of logical operators to
      // avoid extra parentheses (not urgent)
      case 'And':
      case 'Or': {
        let res = '(';
        let first = true;
        for (let i = 0; i < filter.conditions.length; i++) {
          if (first) {
            first = false;
          } else {
            res += ') ' + filter.tagName_.toLowerCase() + ' (';
          }
          res += this.write(filter.conditions[i]);
        }
        return res + ')';
      }
      case 'PropertyIsBetween':
        return (
          filter.property +
          ' BETWEEN ' +
          this.write(filter.lowerBoundary) +
          ' AND ' +
          this.write(filter.upperBoundary)
        );
      case 'PropertyIsEqualTo':
      case 'PropertyIsNotEqualTo':
      case 'PropertyIsLessThan':
      case 'PropertyIsLessThanOrEqualTo':
      case 'PropertyIsGreaterThan':
      case 'PropertyIsGreaterThanOrEqualTo':
      case 'PropertyIsLike':
      case 'PropertyIsNull': {
        return filter.expression !== null
          ? filter.propertyName +
              ' ' +
              this.operatorReverse[filter.tagName_] +
              ' ' +
              this.write(filter.expression)
          : filter.propertyName + ' ' + this.operatorReverse[filter.tagName_];
      }
      case undefined:
        if (typeof filter === 'string') {
          return "'" + filter.replace(/'/g, "''") + "'";
        } else if (typeof filter === 'number') {
          return String(filter);
        }
        break;
      default:
        throw new Error("Can't encode: " + filter.CLASS_NAME + ' ' + filter);
    }
  }

  readGeometry(geometry) {
    //todo 坐标系转化（应该是当前坐标系转化为服务坐标系）
    if (geometry instanceof Geometry) {
      return new WKT().writeGeometry(geometry);
    }
  }
}
