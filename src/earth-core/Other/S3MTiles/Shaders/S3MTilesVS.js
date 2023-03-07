export default `
        attribute vec4 aPosition;
        attribute vec4 aColor;
        attribute vec4 aTexCoord0;
        uniform float uTexture0Width;
        varying vec4 vTexMatrix;
        varying vec4 vTexCoordTransform;
        varying vec4 vSecondColor;
    #ifdef BatchTable
      #ifdef Instance
        attribute float instanceId;
      #else
        attribute float batchId;
      #endif 
    #endif    
    #ifdef TexCoord2
        attribute vec4 aTexCoord1;
        uniform float uTexture1Width;
        varying vec4 vTexMatrix2;
    #endif
    #ifdef Instance
        attribute vec4 uv2;
        attribute vec4 uv3;
        attribute vec4 uv4;
        attribute vec4 secondary_colour;
        attribute vec4 uv6;   
    #endif
        varying vec4 vTexCoord;
        varying vec4 vColor;
        const float SHIFT_LEFT8 = 256.0;
        const float SHIFT_RIGHT8 = 1.0 / 256.0;
        const float SHIFT_RIGHT4 = 1.0 / 16.0;
        const float SHIFT_LEFT4 = 16.0;
        void getTextureMatrixFromZValue(in float nZ, inout float XTran, inout float YTran, inout float scale)
        {
            if(nZ <= 0.0)
            {
                return;
            }
            float nDel8 = floor(nZ * SHIFT_RIGHT8);
            float nDel16 = floor(nDel8 * SHIFT_RIGHT8);
            float nDel20 = floor(nDel16 * SHIFT_RIGHT4);
            YTran = nZ - nDel8 * SHIFT_LEFT8;
            XTran = nDel8 - nDel16 * SHIFT_LEFT8;
            float nLevel = nDel16 - nDel20 * SHIFT_LEFT4;
            scale = 1.0 / pow(2.0, nLevel);
        }
    #ifdef flattenPolygon
        uniform highp sampler2D s3m_flattenPolygonsTexture;
        uniform mat4 s3m_flattenPolygonsViewProjectionMatrix;
        uniform mat4 s3m_flattenPolygonsInverseViewProjectionMatrix;
    #endif
        
        void main()
        {
            vTexCoord.xy = aTexCoord0.xy;
        #ifdef TexCoord2
            vTexCoord.zw = aTexCoord1.xy;
        #endif
            vTexMatrix = vec4(0.0,0.0,1.0,0.0);
            vTexCoordTransform.x = aTexCoord0.z;
            if(vTexCoordTransform.x < -90000.0)
            {
                vTexMatrix.z = -1.0;
            }
            getTextureMatrixFromZValue(floor(vTexCoordTransform.x), vTexMatrix.x, vTexMatrix.y, vTexMatrix.z);
            vTexMatrix.w = log2(uTexture0Width * vTexMatrix.z);
        #ifdef TexCoord2
            vTexMatrix2 = vec4(0.0,0.0,1.0,0.0);
            vTexCoordTransform.y = aTexCoord1.z;
            getTextureMatrixFromZValue(floor(vTexCoordTransform.y), vTexMatrix2.x, vTexMatrix2.y, vTexMatrix2.z);
            vTexMatrix2.w = log2(uTexture1Width * vTexMatrix.z);
        #endif
        vec4 vertexPos = aPosition;
        vec4 vertexColor = aColor;
        #ifdef Instance
            mat4 worldMatrix;
            worldMatrix[0] = uv2;
            worldMatrix[1] = uv3;
            worldMatrix[2] = uv4;
            worldMatrix[3] = vec4(0, 0, 0, 1);
            vertexPos = vec4(vertexPos.xyz,1.0)*worldMatrix;
            vertexColor *= secondary_colour; 
        #endif
        #ifdef BatchTable
        #ifdef Instance  
           float index = instanceId;
        #else
           float index = batchId;
        #endif  
          vSecondColor = batchTable_pickColor(index);
        #endif    
            vColor = vertexColor;
            gl_Position = czm_modelViewProjection * vec4(vertexPos.xyz, 1.0);
            
        #ifdef flattenPolygon
            vec4 fp_position = vec4(vertexPos.xyz,1.0);
            vec4 tc = s3m_flattenPolygonsViewProjectionMatrix * fp_position;
            vec2 tc2 = tc.xy/tc.w;
            if (tc2.x > 0.0 && tc2.x < 1.0 && tc2.y > 0.0 && tc2.y < 1.0)
            {
                vec4 color = texture2D(s3m_flattenPolygonsTexture, tc2);
                if (color.r > 0.0)
                {
                    vec4 cc = vec4(tc2.xy,color.r,1.0);
                    gl_Position = czm_projection * s3m_flattenPolygonsInverseViewProjectionMatrix * cc;
                }
            }
        #endif
        }
    `
