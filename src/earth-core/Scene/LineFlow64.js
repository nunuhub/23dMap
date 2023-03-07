/**
 * @Author han
 * @Date 2020/12/23 14:42
 */

const LineFlow64 = "//2个图片的叠加融合\r\nczm_material czm_getMaterial(czm_materialInput materialInput)\r\n{\r\nczm_material material = czm_getDefaultMaterial(materialInput);\r\nvec2 st = repeat * materialInput.st;\r\nvec4 colorImage = texture2D(image, vec2(fract((axisY?st.t:st.s) - time), st.t));\r\nif(color.a == 0.0)\r\n{\r\n    material.alpha = colorImage.a;\r\n    material.diffuse = colorImage.rgb; \r\n}\r\nelse\r\n{\r\n    material.alpha = colorImage.a * color.a;\r\n    material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \r\n}\r\nvec4 colorBG = texture2D(image2,materialInput.st);\r\nif(colorBG.a>0.5){\r\n    material.diffuse = bgColor.rgb;\r\n}\r\nreturn material;\r\n}"
export { LineFlow64 }