import { parseResult, postFromAdmin } from '../../httprequest';

export function getSaveRuleOptions({
  url,
  tocId,
  token,
  applicationId,
  hasRules
}) {
  return new Promise((resolve) => {
    let ruleOptions;
    if (hasRules && url) {
      let urlReg = url.split('/');
      let baseAdminUrl = urlReg[0] + '//' + urlReg[2] + '/' + urlReg[3];
      postFromAdmin(
        baseAdminUrl + '/tocRule/getInfo',
        {
          tocId: tocId,
          enable: true
        },
        {
          token: token,
          applicationId: applicationId
        }
      )
        .then((response) => {
          let result = parseResult(response);
          if (result.success) {
            if (result.data && result.data.saveRule) {
              ruleOptions = JSON.stringify(result.data.saveRule);
            }
          }
          resolve(ruleOptions);
        })
        .catch(() => {
          resolve();
        });
    } else {
      resolve();
    }
  });
}

export function getDeleteRuleOptions({
  url,
  tocId,
  token,
  applicationId,
  hasRules
}) {
  return new Promise((resolve) => {
    let ruleOptions;
    if (hasRules && url) {
      let urlReg = url.split('/');
      let baseAdminUrl = urlReg[0] + '//' + urlReg[2] + '/' + urlReg[3];
      postFromAdmin(
        baseAdminUrl + '/tocRule/getInfo',
        {
          tocId: tocId,
          enable: true
        },
        {
          token: token,
          applicationId: applicationId
        }
      )
        .then((response) => {
          let result = parseResult(response);
          if (result.success) {
            if (result.data && result.data.delRule) {
              ruleOptions = JSON.stringify(result.data.delRule);
            }
          }
          resolve(ruleOptions);
        })
        .catch(() => {
          resolve();
        });
    } else {
      resolve();
    }
  });
}
