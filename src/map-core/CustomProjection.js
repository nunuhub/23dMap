import proj4 from 'proj4';
import parseCode from 'proj4/lib/parseCode.js';
import projections from 'proj4/lib/projections.js';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4.js';
/**
 * 注册坐标系
 * @param {*} projcode
 * @param extent
 */
export function registerProj(projcode, extent) {
  const proj = getProjection(projcode);
  if (!proj) {
    switch (projcode) {
      case 'EPSG:4490': {
        proj4.defs(
          'EPSG:4490',
          '+proj=longlat +ellps=GRS80 +units=degrees +no_defs'
        );
        register(proj4);
        const proj4490 = getProjection('EPSG:4490');
        proj4490.setExtent([-180, -90, 180, 90]);
        break;
      }
      case 'EPSG:4543': {
        proj4.defs(
          'EPSG:4543',
          '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4543 = getProjection('EPSG:4543');
        proj4543.setExtent([344166.57, 2338205.65, 622925.7, 4729373.22]);
        break;
      }
      case 'EPSG:4545': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 108E
        proj4.defs(
          'EPSG:4545',
          '+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4545 = getProjection('EPSG:4545');
        proj4545.setExtent([341298.83, 2012660.02, 623358.71, 4704933.89]);
        break;
      }
      case 'EPSG:4546': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 111E
        proj4.defs(
          'EPSG:4546',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4546 = getProjection('EPSG:4546');
        proj4546.setExtent([341226.58, 2003802.99, 618043.7, 4998263.83]);
        break;
      }
      case 'EPSG:4547': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 114E
        proj4.defs(
          'EPSG:4547',
          '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4547 = getProjection('EPSG:4547');
        proj4547.setExtent([344577.88, 2381397.91, 617340.63, 5036050.38]);
        break;
      }
      case 'EPSG:4548': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 117E
        proj4.defs(
          'EPSG:4548',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4548 = getProjection('EPSG:4548');
        proj4548.setExtent([345754.3, 2501017.13, 607809.0, 5528578.96]);
        proj4548.setWorldExtent([115.5, 22.6, 118.5, 49.88]);
        break;
      }
      case 'EPSG:4549': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 120E
        proj4.defs(
          'EPSG:4549',
          '+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4549 = getProjection('EPSG:4549');
        proj4549.setExtent([347872.25, 2703739.74, 599933.05, 5912395.2]);

        break;
      }
      case 'EPSG:4550': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 123E
        proj4.defs(
          'EPSG:4550',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4550 = getProjection('EPSG:4550');
        proj4550.setExtent([352748.57, 3123733.99, 599394.66, 5937990.42]);
        break;
      }
      case 'EPSG:4551': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 126E
        proj4.defs(
          'EPSG:4551',
          '+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4551 = getProjection('EPSG:4551');
        proj4551.setExtent([372262.47, 4451705.13, 600236.64, 5897928.74]);
        break;
      }
      case 'EPSG:4552': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 129E
        proj4.defs(
          'EPSG:4552',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4552 = getProjection('EPSG:4552');
        proj4552.setExtent([374503.76, 4582750.41, 606982.71, 5569731.71]);
        break;
      }
      case 'EPSG:4553': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 132E
        proj4.defs(
          'EPSG:4553',
          '+proj=tmerc +lat_0=0 +lon_0=132 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4553 = getProjection('EPSG:4553');
        proj4553.setExtent([376543.13, 4699379.62, 610019.44, 5417367.63]);
        break;
      }
      case 'EPSG:4554': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 135E
        proj4.defs(
          'EPSG:4554',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4554 = getProjection('EPSG:4554');
        proj4554.setExtent([383491.84, 5080507.85, 482969.27, 5362930.84]);
        break;
      }
      case 'EPSG:4534': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 75E
        proj4.defs(
          'EPSG:4534',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4534 = getProjection('EPSG:4534');
        proj4534.setExtent([375272.5, 3965339.75, 626870.23, 4502787.6]);
        break;
      }
      case 'EPSG:4535': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 78E
        proj4.defs(
          'EPSG:4535',
          '+proj=tmerc +lat_0=0 +lon_0=78 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4535 = getProjection('EPSG:4535');
        proj4535.setExtent([356780.75, 3435266.95, 624607.97, 4633842.66]);
        break;
      }
      case 'EPSG:4536': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 81E
        proj4.defs(
          'EPSG:4536',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4536 = getProjection('EPSG:4536');
        proj4536.setExtent([355189.72, 3315517.28, 617221.79, 5083856.92]);
        break;
      }
      case 'EPSG:4537': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 84E
        proj4.defs(
          'EPSG:4537',
          '+proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4537 = getProjection('EPSG:4537');
        proj4537.setExtent([352803.51, 3128167.77, 613592.51, 5233908.47]);
        break;
      }
      case 'EPSG:4538': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 87E
        proj4.defs(
          'EPSG:4538',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4538 = getProjection('EPSG:4538');
        proj4538.setExtent([352176.08, 3077180.78, 609359.83, 5450729.14]);
        break;
      }
      case 'EPSG:4539': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 90E
        proj4.defs(
          'EPSG:4539',
          '+proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4539 = getProjection('EPSG:4539');
        proj4539.setExtent([350541.6, 3023992.26, 611765.09, 5366231.03]);
        break;
      }
      case 'EPSG:4540': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 93E
        proj4.defs(
          'EPSG:4540',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4540 = getProjection('EPSG:4540');
        proj4540.setExtent([352054.43, 3067205.43, 618002.46, 5000486.51]);
        break;
      }
      case 'EPSG:4541': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 96E
        proj4.defs(
          'EPSG:4541',
          '+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4541 = getProjection('EPSG:4541');
        proj4541.setExtent([352762.3, 3124842.44, 620089.9, 4930490.22]);
        break;
      }
      case 'EPSG:4542': {
        // CGCS2000 / 3-degree Gauss-Kruger CM 99E
        proj4.defs(
          'EPSG:4542',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4542 = getProjection('EPSG:4542');
        proj4542.setExtent([344482.32, 2371430.3, 622787.54, 4737149.55]);
        break;
      }
      case 'EPSG:4513': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 25
        proj4.defs(
          'EPSG:4513',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4513 = getProjection('EPSG:4513');
        proj4513.setExtent([25375272.5, 3965339.75, 25626870.23, 4502787.6]);
        break;
      }
      case 'EPSG:4514': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 26
        proj4.defs(
          'EPSG:4514',
          '+proj=tmerc +lat_0=0 +lon_0=78 +k=1 +x_0=26500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4514 = getProjection('EPSG:4514');
        proj4514.setExtent([26356780.75, 3435266.95, 26624607.97, 4633842.66]);
        break;
      }
      case 'EPSG:4515': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 27
        proj4.defs(
          'EPSG:4515',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=27500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4515 = getProjection('EPSG:4515');
        proj4515.setExtent([27355189.72, 3315517.28, 27617221.79, 5083856.92]);
        break;
      }
      case 'EPSG:4516': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 28
        proj4.defs(
          'EPSG:4516',
          '+proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=28500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4516 = getProjection('EPSG:4516');
        proj4516.setExtent([28352803.51, 3128167.77, 28613592.51, 5233908.47]);
        break;
      }
      case 'EPSG:4517': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 29
        proj4.defs(
          'EPSG:4517',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=29500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4517 = getProjection('EPSG:4517');
        proj4517.setExtent([29352176.08, 3077180.78, 29609359.83, 5450729.14]);
        break;
      }
      case 'EPSG:4518': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 30
        proj4.defs(
          'EPSG:4518',
          '+proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=30500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4518 = getProjection('EPSG:4518');
        proj4518.setExtent([30350541.6, 3023992.26, 30611765.09, 5366231.03]);
        break;
      }
      case 'EPSG:4519': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 31
        proj4.defs(
          'EPSG:4519',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=31500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4519 = getProjection('EPSG:4519');
        proj4519.setExtent([31352054.43, 3067205.43, 31618002.46, 5000486.51]);
        break;
      }
      case 'EPSG:4520': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 32
        proj4.defs(
          'EPSG:4520',
          '+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=32500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4520 = getProjection('EPSG:4520');
        proj4520.setExtent([32352762.3, 3124842.44, 32620089.9, 4930490.22]);
        break;
      }
      case 'EPSG:4521': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 33
        proj4.defs(
          'EPSG:4521',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=33500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4521 = getProjection('EPSG:4521');
        proj4521.setExtent([33344482.32, 2371430.3, 33622787.54, 4737149.55]);
        break;
      }
      case 'EPSG:4522': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 34
        proj4.defs(
          'EPSG:4522',
          '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=34500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4522 = getProjection('EPSG:4522');
        proj4522.setExtent([34344166.57, 2338205.65, 34622925.7, 4729373.22]);
        break;
      }
      case 'EPSG:4523': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 35
        proj4.defs(
          'EPSG:4523',
          '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=35500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4523 = getProjection('EPSG:4523');
        proj4523.setExtent([35345643.07, 2489940.65, 35623868.1, 4676052.19]);
        break;
      }
      case 'EPSG:4524': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 36
        proj4.defs(
          'EPSG:4524',
          '+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=36500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4524 = getProjection('EPSG:4524');
        proj4524.setExtent([36341298.83, 2012660.02, 36623358.71, 4704933.89]);
        break;
      }
      case 'EPSG:4525': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 37
        proj4.defs(
          'EPSG:4525',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=37500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4525 = getProjection('EPSG:4525');
        proj4525.setExtent([37341226.58, 2003802.99, 37618043.7, 4998263.83]);
        break;
      }
      case 'EPSG:4526': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 38
        proj4.defs(
          'EPSG:4526',
          '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4526 = getProjection('EPSG:4526');
        proj4526.setExtent([38344577.88, 2381397.91, 38617340.63, 5036050.38]);
        break;
      }
      case 'EPSG:4527': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 39
        proj4.defs(
          'EPSG:4527',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4527 = getProjection('EPSG:4527');
        proj4527.setExtent([39345754.3, 2501017.13, 39607809.0, 5528578.96]);
        break;
      }
      case 'EPSG:4528': {
        // EPSG:4528 (CGCS2000 / 3-degree Gauss-Kruger zone 40)
        proj4.defs(
          'EPSG:4528',
          '+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=40500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4528 = getProjection('EPSG:4528');
        proj4528.setExtent([40347872.25, 2703739.74, 40599933.05, 5912395.2]);
        break;
      }
      case 'EPSG:4529': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 41
        proj4.defs(
          'EPSG:4529',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=41500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4529 = getProjection('EPSG:4529');
        proj4529.setExtent([41352748.57, 3123733.99, 41599394.66, 5937990.42]);
        break;
      }
      case 'EPSG:4530': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 42
        proj4.defs(
          'EPSG:4530',
          '+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=42500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4530 = getProjection('EPSG:4530');
        proj4530.setExtent([42372262.47, 4451705.13, 42600236.64, 5897928.74]);
        break;
      }
      case 'EPSG:4531': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 43
        proj4.defs(
          'EPSG:4531',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=43500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4531 = getProjection('EPSG:4531');
        proj4531.setExtent([43374503.76, 4582750.41, 43606982.71, 5569731.71]);
        break;
      }
      case 'EPSG:4532': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 44
        proj4.defs(
          'EPSG:4532',
          '+proj=tmerc +lat_0=0 +lon_0=132 +k=1 +x_0=44500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4532 = getProjection('EPSG:4532');
        proj4532.setExtent([44376543.13, 4699379.62, 44610019.44, 5417367.63]);
        break;
      }
      case 'EPSG:4533': {
        // CGCS2000 / 3-degree Gauss-Kruger zone 45
        proj4.defs(
          'EPSG:4533',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=45500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4533 = getProjection('EPSG:4533');
        proj4533.setExtent([45383491.84, 5080507.85, 45482969.27, 5362930.84]);
        break;
      }
      case 'EPSG:4507': {
        // CGCS2000 / Gauss-Kruger CM 105E
        proj4.defs(
          'EPSG:4507',
          '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4507 = getProjection('EPSG:4507');
        proj4507.setExtent([181721.15, 1965854.14, 746725.01, 4708206.87]);
        break;
      }
      case 'EPSG:4508': {
        // CGCS2000 / Gauss-Kruger CM 111E
        proj4.defs(
          'EPSG:4508',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4508 = getProjection('EPSG:4508');
        proj4508.setExtent([179915.67, 1849516.47, 736087.19, 5001549.83]);
        break;
      }
      case 'EPSG:4509': {
        // CGCS2000 / Gauss-Kruger CM 117E
        proj4.defs(
          'EPSG:4509',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4509 = getProjection('EPSG:4509');
        proj4509.setExtent([184047.25, 2106579.41, 708208.94, 5714206.25]);
        break;
      }
      case 'EPSG:4510': {
        // CGCS2000 / Gauss-Kruger CM 123E
        proj4.defs(
          'EPSG:4510',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4510 = getProjection('EPSG:4510');
        proj4510.setExtent([196182.08, 2729495.05, 698769.28, 5941131.59]);
        break;
      }
      case 'EPSG:4511': {
        // CGCS2000 / Gauss-Kruger CM 129E
        proj4.defs(
          'EPSG:4511',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4511 = getProjection('EPSG:4511');
        proj4511.setExtent([209606.47, 3290627.32, 702362.77, 5855471.68]);
        break;
      }
      case 'EPSG:4512': {
        // CGCS2000 / Gauss-Kruger CM 135E
        proj4.defs(
          'EPSG:4512',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4512 = getProjection('EPSG:4512');
        proj4512.setExtent([263541.74, 4991547.88, 482969.27, 5362930.84]);
        break;
      }
      case 'EPSG:4502': {
        // CGCS2000 / Gauss-Kruger CM 75E
        proj4.defs(
          'EPSG:4502',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4502 = getProjection('EPSG:4502');
        proj4502.setExtent([374665.41, 3922064.44, 752994.91, 4552715.22]);
        break;
      }
      case 'EPSG:4503': {
        // CGCS2000 / Gauss-Kruger CM 81E
        proj4.defs(
          'EPSG:4503',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4503 = getProjection('EPSG:4503');
        proj4503.setExtent([206116.83, 3230779.31, 727179.04, 5237184.74]);
        break;
      }
      case 'EPSG:4504': {
        // CGCS2000 / Gauss-Kruger CM 87E
        proj4.defs(
          'EPSG:4504',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4504 = getProjection('EPSG:4504');
        proj4504.setExtent([203003.72, 3026658.93, 718708.81, 5453980.63]);
        break;
      }
      case 'EPSG:4505': {
        // CGCS2000 / Gauss-Kruger CM 93E
        proj4.defs(
          'EPSG:4505',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4505 = getProjection('EPSG:4505');
        proj4505.setExtent([204050.9, 3069909.68, 725045.7, 5311696.64]);
        break;
      }
      case 'EPSG:4506': {
        // CGCS2000 / Gauss-Kruger CM 99E
        proj4.defs(
          'EPSG:4506',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4506 = getProjection('EPSG:4506');
        proj4506.setExtent([188253.52, 2340414.16, 744727.96, 4787117.85]);
        break;
      }
      case 'EPSG:4491': {
        // CGCS2000 / Gauss-Kruger zone 13
        proj4.defs(
          'EPSG:4491',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=13500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4491 = getProjection('EPSG:4491');
        proj4491.setExtent([13374665.41, 3922064.44, 13752994.91, 4552715.22]);
        break;
      }
      case 'EPSG:4492': {
        // CGCS2000 / Gauss-Kruger zone 14
        proj4.defs(
          'EPSG:4492',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=14500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4492 = getProjection('EPSG:4492');
        proj4492.setExtent([14206116.83, 3230779.31, 14727179.04, 5237184.74]);
        break;
      }
      case 'EPSG:4493': {
        // CGCS2000 / Gauss-Kruger zone 15
        proj4.defs(
          'EPSG:4493',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=15500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4493 = getProjection('EPSG:4493');
        proj4493.setExtent([15203003.72, 3026658.93, 15718708.81, 5453980.63]);
        break;
      }
      case 'EPSG:4494': {
        // CGCS2000 / Gauss-Kruger zone 16
        proj4.defs(
          'EPSG:4494',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=16500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4494 = getProjection('EPSG:4494');
        proj4494.setExtent([16204050.9, 3069909.68, 16725045.7, 5311696.64]);
        break;
      }
      case 'EPSG:4495': {
        // CGCS2000 / Gauss-Kruger zone 17
        proj4.defs(
          'EPSG:4495',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=17500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4495 = getProjection('EPSG:4495');
        proj4495.setExtent([17188253.52, 2340414.16, 17744727.96, 4787117.85]);
        break;
      }
      case 'EPSG:4496': {
        // CGCS2000 / Gauss-Kruger zone 18
        proj4.defs(
          'EPSG:4496',
          '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=18500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4496 = getProjection('EPSG:4496');
        proj4496.setExtent([18181721.15, 1965854.14, 18746725.01, 4708206.87]);
        break;
      }
      case 'EPSG:4497': {
        // CGCS2000 / Gauss-Kruger zone 19
        proj4.defs(
          'EPSG:4497',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=19500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4497 = getProjection('EPSG:4497');
        proj4497.setExtent([19179915.67, 1849516.47, 19736087.19, 5001549.83]);
        break;
      }
      case 'EPSG:4498': {
        // CGCS2000 / Gauss-Kruger zone 20
        proj4.defs(
          'EPSG:4498',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=20500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4498 = getProjection('EPSG:4498');
        proj4498.setExtent([20184047.25, 2106579.41, 20708208.94, 5714206.25]);
        break;
      }
      case 'EPSG:4499': {
        // CGCS2000 / Gauss-Kruger zone 21
        proj4.defs(
          'EPSG:4499',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=21500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4499 = getProjection('EPSG:4499');
        proj4499.setExtent([21196182.08, 2729495.05, 21698769.28, 5941131.59]);
        break;
      }
      case 'EPSG:4500': {
        // CGCS2000 / Gauss-Kruger zone 22
        proj4.defs(
          'EPSG:4500',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=22500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4500 = getProjection('EPSG:4500');
        proj4500.setExtent([22209606.47, 3290627.32, 22702362.77, 5855471.68]);
        break;
      }
      case 'EPSG:4501': {
        // CGCS2000 / Gauss-Kruger zone 23
        proj4.defs(
          'EPSG:4501',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=23500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        );
        register(proj4);
        const proj4501 = getProjection('EPSG:4501');
        proj4501.setExtent([23263541.74, 4991547.88, 23482969.27, 5362930.84]);
        break;
      }
      case 'EPSG:4610': {
        // Xian 1980
        proj4.defs(
          'EPSG:4610',
          '+proj=longlat +a=6378140 +b=6356755.288157528 +units=degrees +no_defs'
        );
        register(proj4);
        const proj4610 = getProjection('EPSG:4610');
        proj4610.setExtent([-180, -90, 180, 90]); // 73.62, 18.11, 134.77, 53.56
        break;
      }
      case 'EPSG:2379': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 102E
        proj4.defs(
          'EPSG:2379',
          '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2379 = getProjection('EPSG:2379');
        proj2379.setExtent([344166.5, 2338206.74, 622925.76, 4729375.42]);
        break;
      }
      case 'EPSG:2380': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 105E
        proj4.defs(
          'EPSG:2380',
          '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2380 = getProjection('EPSG:2380');
        proj2380.setExtent([345643.0, 2489941.81, 623868.16, 4676054.37]);
        break;
      }
      case 'EPSG:2381': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 108E
        proj4.defs(
          'EPSG:2381',
          '+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2381 = getProjection('EPSG:2381');
        proj2381.setExtent([341298.75, 2012660.96, 623358.77, 4704936.09]);
        break;
      }
      case 'EPSG:2382': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 111E
        proj4.defs(
          'EPSG:2382',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2382 = getProjection('EPSG:2382');
        proj2382.setExtent([341226.51, 2003803.92, 618043.76, 4998266.16]);
        break;
      }
      case 'EPSG:2383': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 114E
        proj4.defs(
          'EPSG:2383',
          '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2383 = getProjection('EPSG:2383');
        proj2383.setExtent([344577.81, 2381399.02, 617340.68, 5036052.73]);
        break;
      }
      case 'EPSG:2384': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 117E
        proj4.defs(
          'EPSG:2384',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2384 = getProjection('EPSG:2384');
        proj2384.setExtent([345754.23, 2501018.29, 607809.05, 5528581.54]);
        break;
      }
      case 'EPSG:2385': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 120E
        proj4.defs(
          'EPSG:2385',
          '+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2385 = getProjection('EPSG:2385');
        proj2385.setExtent([347872.18, 2703741.0, 599933.1, 5912397.96]);
        break;
      }
      case 'EPSG:2386': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 123E
        proj4.defs(
          'EPSG:2386',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2386 = getProjection('EPSG:2386');
        proj2386.setExtent([352748.5, 3123735.45, 599394.71, 5937993.2]);
        break;
      }
      case 'EPSG:2387': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 126E
        proj4.defs(
          'EPSG:2387',
          '+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2387 = getProjection('EPSG:2387');
        proj2387.setExtent([372262.41, 4451707.2, 600236.68, 5897931.5]);
        break;
      }
      case 'EPSG:2388': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 129E
        proj4.defs(
          'EPSG:2388',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2388 = getProjection('EPSG:2388');
        proj2388.setExtent([374503.71, 4582752.55, 606982.76, 5569734.31]);
        break;
      }
      case 'EPSG:2389': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 132E
        proj4.defs(
          'EPSG:2389',
          '+proj=tmerc +lat_0=0 +lon_0=132 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2389 = getProjection('EPSG:2389');
        proj2389.setExtent([376543.07, 4699381.82, 610019.49, 5417370.16]);
        break;
      }
      case 'EPSG:2390': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 135E
        proj4.defs(
          'EPSG:2390',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2390 = getProjection('EPSG:2390');
        proj2390.setExtent([383491.79, 5080510.22, 482969.27, 5362933.35]);
        break;
      }
      case 'EPSG:2370': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 75E
        proj4.defs(
          'EPSG:2370',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2370 = getProjection('EPSG:2370');
        proj2370.setExtent([375272.44, 3965341.6, 626870.29, 4502789.7]);
        break;
      }
      case 'EPSG:2371': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 78E
        proj4.defs(
          'EPSG:2371',
          '+proj=tmerc +lat_0=0 +lon_0=78 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2371 = getProjection('EPSG:2371');
        proj2371.setExtent([356780.68, 3435268.56, 624608.03, 4633844.82]);
        break;
      }
      case 'EPSG:2372': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 81E
        proj4.defs(
          'EPSG:2372',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2372 = getProjection('EPSG:2372');
        proj2372.setExtent([355189.66, 3315518.83, 617221.84, 5083859.29]);
        break;
      }
      case 'EPSG:2373': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 84E
        proj4.defs(
          'EPSG:2373',
          '+proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2373 = getProjection('EPSG:2373');
        proj2373.setExtent([352803.44, 3128169.23, 613592.56, 5233910.91]);
        break;
      }
      case 'EPSG:2374': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 87E
        proj4.defs(
          'EPSG:2374',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2374 = getProjection('EPSG:2374');
        proj2374.setExtent([352176.01, 3077182.21, 609359.88, 5450731.68]);
        break;
      }
      case 'EPSG:2375': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 90E
        proj4.defs(
          'EPSG:2375',
          '+proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2375 = getProjection('EPSG:2375');
        proj2375.setExtent([350541.53, 3023993.67, 611765.14, 5366233.54]);
        break;
      }
      case 'EPSG:2376': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 93E
        proj4.defs(
          'EPSG:2376',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2376 = getProjection('EPSG:2376');
        proj2376.setExtent([352054.36, 3067206.86, 618002.52, 5000488.84]);
        break;
      }
      case 'EPSG:2377': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 96E
        proj4.defs(
          'EPSG:2377',
          '+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2377 = getProjection('EPSG:2377');
        proj2377.setExtent([352762.23, 3124843.89, 620089.96, 4930492.52]);
        break;
      }
      case 'EPSG:2378': {
        // Xian 1980 / 3-degree Gauss-Kruger CM 99E
        proj4.defs(
          'EPSG:2378',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2378 = getProjection('EPSG:2378');
        proj2378.setExtent([344482.25, 2371431.4, 622787.6, 4737151.76]);
        break;
      }
      case 'EPSG:2349': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 25
        proj4.defs(
          'EPSG:2349',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=25500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2349 = getProjection('EPSG:2349');
        proj2349.setExtent([25375272.44, 3965341.6, 25626870.29, 4502789.7]);
        break;
      }
      case 'EPSG:2350': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 26
        proj4.defs(
          'EPSG:2350',
          '+proj=tmerc +lat_0=0 +lon_0=78 +k=1 +x_0=26500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2350 = getProjection('EPSG:2350');
        proj2350.setExtent([26356780.68, 3435268.56, 26624608.03, 4633844.82]);
        break;
      }
      case 'EPSG:2351': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 27
        proj4.defs(
          'EPSG:2351',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=27500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2351 = getProjection('EPSG:2351');
        proj2351.setExtent([27355189.66, 3315518.83, 27617221.84, 5083859.29]);
        break;
      }
      case 'EPSG:2352': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 28
        proj4.defs(
          'EPSG:2352',
          '+proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=28500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2352 = getProjection('EPSG:2352');
        proj2352.setExtent([28352803.44, 3128169.23, 28613592.56, 5233910.91]);
        break;
      }
      case 'EPSG:2353': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 29
        proj4.defs(
          'EPSG:2353',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=29500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2353 = getProjection('EPSG:2353');
        proj2353.setExtent([29352176.01, 3077182.21, 29609359.88, 5450731.68]);
        break;
      }
      case 'EPSG:2354': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 30
        proj4.defs(
          'EPSG:2354',
          '+proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=30500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2354 = getProjection('EPSG:2354');
        proj2354.setExtent([30350541.53, 3023993.67, 30611765.14, 5366233.54]);
        break;
      }
      case 'EPSG:2355': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 31
        proj4.defs(
          'EPSG:2355',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=31500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2355 = getProjection('EPSG:2355');
        proj2355.setExtent([31352054.36, 3067206.86, 31618002.52, 5000488.84]);
        break;
      }
      case 'EPSG:2356': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 32
        proj4.defs(
          'EPSG:2356',
          '+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=32500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2356 = getProjection('EPSG:2356');
        proj2356.setExtent([32352762.23, 3124843.89, 32620089.96, 4930492.52]);
        break;
      }
      case 'EPSG:2357': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 33
        proj4.defs(
          'EPSG:2357',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=33500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2357 = getProjection('EPSG:2357');
        proj2357.setExtent([33344482.25, 2371431.4, 33622787.6, 4737151.76]);
        break;
      }
      case 'EPSG:2358': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 34
        proj4.defs(
          'EPSG:2358',
          '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=34500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2358 = getProjection('EPSG:2358');
        proj2358.setExtent([34344166.5, 2338206.74, 34622925.76, 4729375.42]);
        break;
      }
      case 'EPSG:2359': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 35
        proj4.defs(
          'EPSG:2359',
          '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=35500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2359 = getProjection('EPSG:2359');
        proj2359.setExtent([35345643.0, 2489941.81, 35623868.16, 4676054.37]);
        break;
      }
      case 'EPSG:2360': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 36
        proj4.defs(
          'EPSG:2360',
          '+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=36500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2360 = getProjection('EPSG:2360');
        proj2360.setExtent([36341298.75, 2012660.96, 36623358.77, 4704936.09]);
        break;
      }
      case 'EPSG:2361': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 37
        proj4.defs(
          'EPSG:2361',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=37500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2361 = getProjection('EPSG:2361');
        proj2361.setExtent([37341226.51, 2003803.92, 37618043.76, 4998266.16]);
        break;
      }
      case 'EPSG:2362': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 38
        proj4.defs(
          'EPSG:2362',
          '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2362 = getProjection('EPSG:2362');
        proj2362.setExtent([38344577.81, 2381399.02, 38617340.68, 5036052.73]);
        break;
      }
      case 'EPSG:2363': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 39
        proj4.defs(
          'EPSG:2363',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2363 = getProjection('EPSG:2363');
        proj2363.setExtent([39345754.23, 2501018.29, 39607809.05, 5528581.54]);
        break;
      }
      case 'EPSG:2364': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 40
        proj4.defs(
          'EPSG:2364',
          '+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=40500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2364 = getProjection('EPSG:2364');
        proj2364.setExtent([40347872.18, 2703741.0, 40599933.1, 5912397.96]);
        break;
      }
      case 'EPSG:2365': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 41
        proj4.defs(
          'EPSG:2365',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=41500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2365 = getProjection('EPSG:2365');
        proj2365.setExtent([41352748.5, 3123735.45, 41599394.71, 5937993.2]);
        break;
      }
      case 'EPSG:2366': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 42
        proj4.defs(
          'EPSG:2366',
          '+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=42500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2366 = getProjection('EPSG:2366');
        proj2366.setExtent([42372262.41, 4451707.2, 42600236.68, 5897931.5]);
        break;
      }
      case 'EPSG:2367': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 43
        proj4.defs(
          'EPSG:2367',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=43500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2367 = getProjection('EPSG:2367');
        proj2367.setExtent([43374503.71, 4582752.55, 43606982.76, 5569734.31]);
        break;
      }
      case 'EPSG:2368': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 44
        proj4.defs(
          'EPSG:2368',
          '+proj=tmerc +lat_0=0 +lon_0=132 +k=1 +x_0=44500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2368 = getProjection('EPSG:2368');
        proj2368.setExtent([44376543.07, 4699381.82, 44610019.49, 5417370.16]);
        break;
      }
      case 'EPSG:2369': {
        // Xian 1980 / 3-degree Gauss-Kruger zone 45
        proj4.defs(
          'EPSG:2369',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=45500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2369 = getProjection('EPSG:2369');
        proj2369.setExtent([45383491.79, 5080510.22, 45482969.27, 5362933.35]);
        break;
      }
      case 'EPSG:2343': {
        // Xian 1980 / Gauss-Kruger CM 105E
        proj4.defs(
          'EPSG:2343',
          '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2343 = getProjection('EPSG:2343');
        proj2343.setExtent([189098.51, 2384748.79, 746725.12, 4708209.07]);
        break;
      }
      case 'EPSG:2344': {
        // Xian 1980 / Gauss-Kruger CM 111E
        proj4.defs(
          'EPSG:2344',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2344 = getProjection('EPSG:2344');
        proj2344.setExtent([182364.58, 2005744.33, 736087.3, 5001552.17]);
        break;
      }
      case 'EPSG:2345': {
        // Xian 1980 / Gauss-Kruger CM 117E
        proj4.defs(
          'EPSG:2345',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2345 = getProjection('EPSG:2345');
        proj2345.setExtent([190416.42, 2452360.4, 708209.04, 5714208.92]);
        break;
      }
      case 'EPSG:2346': {
        // Xian 1980 / Gauss-Kruger CM 123E
        proj4.defs(
          'EPSG:2346',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2346 = getProjection('EPSG:2346');
        proj2346.setExtent([200433.02, 2917986.59, 698769.38, 5941134.37]);
        break;
      }
      case 'EPSG:2347': {
        // Xian 1980 / Gauss-Kruger CM 129E
        proj4.defs(
          'EPSG:2347',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2347 = getProjection('EPSG:2347');
        proj2347.setExtent([247158.43, 4532694.83, 702362.87, 5855474.42]);
        break;
      }
      case 'EPSG:2348': {
        // Xian 1980 / Gauss-Kruger CM 135E
        proj4.defs(
          'EPSG:2348',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2348 = getProjection('EPSG:2348');
        proj2348.setExtent([263541.63, 4991550.21, 482969.27, 5362933.35]);
        break;
      }
      case 'EPSG:2338': {
        // Xian 1980 / Gauss-Kruger CM 75E
        proj4.defs(
          'EPSG:2338',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2338 = getProjection('EPSG:2338');
        proj2338.setExtent([374665.35, 3922066.27, 752995.03, 4552717.34]);
        break;
      }
      case 'EPSG:2339': {
        // Xian 1980 / Gauss-Kruger CM 81E
        proj4.defs(
          'EPSG:2339',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2339 = getProjection('EPSG:2339');
        proj2339.setExtent([206116.69, 3230780.81, 727179.14, 5237187.19]);
        break;
      }
      case 'EPSG:2340': {
        // Xian 1980 / Gauss-Kruger CM 87E
        proj4.defs(
          'EPSG:2340',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2340 = getProjection('EPSG:2340');
        proj2340.setExtent([203003.59, 3026660.34, 718708.91, 5453983.17]);
        break;
      }
      case 'EPSG:2341': {
        // Xian 1980 / Gauss-Kruger CM 93E
        proj4.defs(
          'EPSG:2341',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2341 = getProjection('EPSG:2341');
        proj2341.setExtent([204050.76, 3069911.11, 725045.8, 5311699.12]);
        break;
      }
      case 'EPSG:2342': {
        // Xian 1980 / Gauss-Kruger CM 99E
        proj4.defs(
          'EPSG:2342',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2342 = getProjection('EPSG:2342');
        proj2342.setExtent([188253.38, 2340415.25, 744728.08, 4787120.08]);
        break;
      }
      case 'EPSG:2327': {
        // Xian 1980 / Gauss-Kruger zone 13
        proj4.defs(
          'EPSG:2327',
          '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=13500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2327 = getProjection('EPSG:2327');
        proj2327.setExtent([13374665.35, 3922066.27, 13752995.03, 4552717.34]);
        break;
      }
      case 'EPSG:2328': {
        // Xian 1980 / Gauss-Kruger zone 14
        proj4.defs(
          'EPSG:2328',
          '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=14500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2328 = getProjection('EPSG:2328');
        proj2328.setExtent([14206116.69, 3230780.81, 14727179.14, 5237187.19]);
        break;
      }
      case 'EPSG:2329': {
        // Xian 1980 / Gauss-Kruger zone 15
        proj4.defs(
          'EPSG:2329',
          '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=15500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2329 = getProjection('EPSG:2329');
        proj2329.setExtent([15203003.59, 3026660.34, 15718708.91, 5453983.17]);
        break;
      }
      case 'EPSG:2330': {
        // Xian 1980 / Gauss-Kruger zone 16
        proj4.defs(
          'EPSG:2330',
          '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=16500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2330 = getProjection('EPSG:2330');
        proj2330.setExtent([16204050.76, 3069911.11, 16725045.8, 5311699.12]);
        break;
      }
      case 'EPSG:2331': {
        // Xian 1980 / Gauss-Kruger zone 17
        proj4.defs(
          'EPSG:2331',
          '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=17500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2331 = getProjection('EPSG:2331');
        proj2331.setExtent([17188253.38, 2340415.25, 17744728.08, 4787120.08]);
        break;
      }
      case 'EPSG:2332': {
        // Xian 1980 / Gauss-Kruger zone 18
        proj4.defs(
          'EPSG:2332',
          '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=18500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2332 = getProjection('EPSG:2332');
        proj2332.setExtent([18189098.51, 2384748.79, 18746725.12, 4708209.07]);
        break;
      }
      case 'EPSG:2333': {
        // Xian 1980 / Gauss-Kruger zone 19
        proj4.defs(
          'EPSG:2333',
          '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=19500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2333 = getProjection('EPSG:2333');
        proj2333.setExtent([19182364.58, 2005744.33, 19736087.3, 5001552.17]);
        break;
      }
      case 'EPSG:2334': {
        // Xian 1980 / Gauss-Kruger zone 20
        proj4.defs(
          'EPSG:2334',
          '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=20500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2334 = getProjection('EPSG:2334');
        proj2334.setExtent([20190416.42, 2452360.4, 20708209.04, 5714208.92]);
        break;
      }
      case 'EPSG:2335': {
        // Xian 1980 / Gauss-Kruger zone 21
        proj4.defs(
          'EPSG:2335',
          '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=21500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2335 = getProjection('EPSG:2335');
        proj2335.setExtent([21200433.02, 2917986.59, 21698769.38, 5941134.37]);
        break;
      }
      case 'EPSG:2336': {
        // Xian 1980 / Gauss-Kruger zone 22
        proj4.defs(
          'EPSG:2336',
          '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=22500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2336 = getProjection('EPSG:2336');
        proj2336.setExtent([22247158.43, 4532694.83, 22702362.87, 5855474.42]);
        break;
      }
      case 'EPSG:2337': {
        // Xian 1980 / Gauss-Kruger zone 23
        proj4.defs(
          'EPSG:2337',
          '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=23500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
        );
        register(proj4);
        const proj2337 = getProjection('EPSG:2337');
        proj2337.setExtent([23263541.63, 4991550.21, 23482969.27, 5362933.35]);
        break;
      }
      default:
        // 非标准坐标系
        if (projcode) {
          const isSupport = checkProj(projcode, (srsCode, json) => {
            // 若json.projName='Gauss_Kruger'
            if (json.projName === 'Gauss_Kruger') {
              const newProjcode = projcode.replace(
                'Gauss_Kruger',
                'Transverse_Mercator'
              );
              proj4.defs(projcode, newProjcode);
            } else if (json.projName === 'Local') {
              // WKT对应的PROJECTIONS不支持，转化为特定坐标系进行尝试
              const projTemplate =
                '+proj={0} +lat_0={1} +lon_0={2} +k={3} +x_0={4} +y_0={5} +ellps={6} +a={7} +b={8} +units=m +no_defs ';
              const newProjcode = projTemplate.format(
                'tmerc',
                json.latitude_of_center,
                json.longitude_of_center,
                json.k0,
                json.false_easting,
                json.false_northing,
                json.ellps,
                json.a,
                json.a - json.a / json.rf
              );
              proj4.defs(projcode, newProjcode);
            }
          });
          // 支持WKT对应的PROJECTIONS,直接进行defs
          if (isSupport) {
            proj4.defs(projcode, projcode);
          }
          // 注册坐标系
          register(proj4);
          const projOther = getProjection(projcode);
          projOther.setExtent(extent);
        }
    }
  }
}
function checkProj(srsCode, callback) {
  var json = parseCode(srsCode);
  if (typeof json !== 'object') {
    callback(srsCode, json);
    return;
  }
  var ourProj = projections.get(json.projName);
  if (!ourProj) {
    callback(srsCode, json);
    return;
  }
  return true;
}

// eslint-disable-next-line no-extend-native
String.prototype.format = function () {
  if (arguments.length === 0) return this;
  var param = arguments[0];
  var s = this;
  if (typeof param === 'object') {
    for (var key in param) {
      s = s.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key]);
    }
    return s;
  } else {
    for (var i = 0; i < arguments.length; i++) {
      s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), arguments[i]);
    }
    return s;
  }
};

export function getProj(projcode) {
  return getProjection(projcode);
}
