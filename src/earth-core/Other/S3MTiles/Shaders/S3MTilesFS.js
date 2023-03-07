export default `
        #extension GL_OES_standard_derivatives : enable
        uniform vec4 uDiffuseColor;
        uniform vec4 uAmbientColor;
        varying vec4 vColor;
        varying vec4 vSecondColor;
        uniform sampler2D uTexture;
        varying vec4 vTexCoord;
        varying vec4 vTexCoordTransform;
        uniform float uTexture0Width;
        varying vec4 vTexMatrix;
    #ifdef TexCoord2
        uniform sampler2D uTexture2;
        uniform float uTexture1Width;
        varying vec4 vTexMatrix2;
    #endif
        void calculateMipLevel(in vec2 inTexCoord, in float vecTile, in float fMaxMip, inout float mipLevel)
        {
            vec2 dx = dFdx(inTexCoord * vecTile);
            vec2 dy = dFdy(inTexCoord * vecTile);
            float dotX = dot(dx, dx);
            float dotY = dot(dy, dy);
            float dMax = max(dotX, dotY);
            float dMin = min(dotX, dotY);
            float offset = (dMax - dMin) / (dMax + dMin);
            offset = clamp(offset, 0.0, 1.0);
            float d = dMax * (1.0 - offset) + dMin * offset;
            mipLevel = 0.5 * log2(d);
            mipLevel = clamp(mipLevel, 0.0, fMaxMip - 1.62);
        }

        void calculateMipLevel(in vec2 inTexCoord, in vec2 vecTile, in float fMaxMip, inout float mipLevel)
        {
            vec2 dx = dFdx(inTexCoord * vecTile.x);
            vec2 dy = dFdy(inTexCoord * vecTile.y);
            float dotX = dot(dx, dx);
            float dotY = dot(dy, dy);
            float dMax = max(dotX, dotY);
            float dMin = min(dotX, dotY);
            float offset = (dMax - dMin) / (dMax + dMin);
            offset = clamp(offset, 0.0, 1.0);
            float d = dMax * (1.0 - offset) + dMin * offset;
            mipLevel = 0.5 * log2(d);
            mipLevel = clamp(mipLevel, 0.0, fMaxMip - 1.62);
        }

        void calculateTexCoord(in vec3 inTexCoord, in float scale, in float XTran, in float YTran, in float fTile, in float mipLevel, inout vec2 outTexCoord)
        {
            if(inTexCoord.z < -9000.0)
            {
                outTexCoord = inTexCoord.xy;
            }
            else
            {
                vec2 fTexCoord = fract(inTexCoord.xy);
                float offset = 1.0 * pow(2.0, mipLevel) / fTile;
                fTexCoord = clamp(fTexCoord, offset, 1.0 - offset);
                outTexCoord.x = (fTexCoord.x + XTran) * scale;
                outTexCoord.y = (fTexCoord.y + YTran) * scale;
            }
        }

        vec4 getTexColorForS3M(sampler2D curTexture, vec3 oriTexCoord, float texTileWidth, float fMaxMipLev, float fTexCoordScale, vec2 vecTexCoordTranslate)
        {
            vec4 color = vec4(1.0);
            float mipLevel = 0.0;
        #ifdef GL_OES_standard_derivatives
            calculateMipLevel(oriTexCoord.xy, texTileWidth, fMaxMipLev, mipLevel);
        #endif
            vec2 realTexCoord;
            calculateTexCoord(oriTexCoord, fTexCoordScale, vecTexCoordTranslate.x, vecTexCoordTranslate.y, texTileWidth, mipLevel, realTexCoord);
            if(oriTexCoord.z < -9000.0)
            {
                color = texture2D(curTexture, realTexCoord.xy);
            }
            else
            {
                #ifdef GL_EXT_shader_texture_lod
                    color = texture2DLodEXT(curTexture, realTexCoord.xy, mipLevel);
                #else
                    color = texture2D(curTexture, realTexCoord.xy, mipLevel);
                #endif
            }
            return color;
        }

        vec4 getTextureColor()
        {
            if(vTexMatrix.z < 0.0)
            {
                return vec4(1.0);
            }
            float texTileWidth0 = vTexMatrix.z * uTexture0Width;
            vec3 realTexCoord = vec3(vTexCoord.xy, vTexCoordTransform.x);
            vec4 FColor = getTexColorForS3M(uTexture, realTexCoord, texTileWidth0, vTexMatrix.w, vTexMatrix.z, vTexMatrix.xy);
        #ifdef TexCoord2
            float texTileWidth1 = vTexMatrix2.z * uTexture1Width;
            realTexCoord = vec3(vTexCoord.zw, vTexCoordTransform.y);
            vec4 SColor = getTexColorForS3M(uTexture2, realTexCoord, texTileWidth1, vTexMatrix2.w, vTexMatrix2.z, vTexMatrix2.xy);
            SColor.r = clamp(SColor.r, 0.0, 1.0);
            SColor.g = clamp(SColor.g, 0.0, 1.0);
            SColor.b = clamp(SColor.b, 0.0, 1.0);
            return FColor * SColor;
        #else
            return FColor;
        #endif
        }

    #ifdef clippingPlane
    #ifdef clippingPlanesUsingFloatTexture
        vec4 getClippingPlane(highp sampler2D packedClippingPlanes, int clippingPlaneNumber, mat4 transform, int width, int height)
        {
            int pixY = clippingPlaneNumber / width;
            int pixX = clippingPlaneNumber - (pixY * width);
            float u = (float(pixX) + 0.5) / float(width);
            float v = (float(pixY) + 0.5) / float(height);
            vec4 plane = texture2D(packedClippingPlanes, vec2(u, v));
            return czm_transformPlane(plane, transform);
        }
    #else
        vec4 getClippingPlane(highp sampler2D packedClippingPlanes, int clippingPlaneNumber, mat4 transform, int width, int height)
        {
            int clippingPlaneStartIndex = clippingPlaneNumber * 2;
            int pixY = clippingPlaneStartIndex / width;
            int pixX = clippingPlaneStartIndex - (pixY * width);
            float u = (float(pixX) + 0.5) / float(width);
            float v = (float(pixY) + 0.5) / float(height);
            vec4 oct32 = texture2D(packedClippingPlanes, vec2(u, v)) * 255.0;
            vec2 oct = vec2(oct32.x * 256.0 + oct32.y, oct32.z * 256.0 + oct32.w);
            vec4 plane;
            plane.xyz = czm_octDecode(oct, 65535.0);
            plane.w = czm_unpackFloat(texture2D(packedClippingPlanes, vec2(u + pixelWidthString, v)));
            return czm_transformPlane(plane, transform);
        }
    #endif
    #ifdef unionClippingRegions
        float clip(vec4 fragCoord, highp sampler2D clippingPlanes, mat4 clippingPlanesMatrix, int width, int height, int clippingPlanesLength)
        {
            vec4 position = czm_windowToEyeCoordinates(fragCoord);
            vec3 clipNormal = vec3(0.0);
            vec3 clipPosition = vec3(0.0);
            float clipAmount;
            float pixelWidth = czm_metersPerPixel(position);
            bool breakAndDiscard = false;
            for (int i = 0; i < 1000; ++i)
            {
                if (i >= clippingPlanesLength)
                {
                    break;
                }
                vec4 clippingPlanei = getClippingPlane(clippingPlanes, i, clippingPlanesMatrix, width, height);
                clipNormal = clippingPlanei.xyz;
                clipPosition = -clippingPlanei.w * clipNormal;
                float amount = dot(clipNormal, (position.xyz - clipPosition)) / pixelWidth;
                clipAmount = czm_branchFreeTernary(i == 0, amount, min(amount, clipAmount));
                if (amount <= 0.0)
                {
                   breakAndDiscard = true;
                   break;
                }
            }
            if (breakAndDiscard) {
                discard;
            }
            return clipAmount;
        }
    #else
        float clip(vec4 fragCoord, highp sampler2D clippingPlanes, mat4 clippingPlanesMatrix, int width, int height, int clippingPlanesLength)
        {
            bool clipped = true;
            vec4 position = czm_windowToEyeCoordinates(fragCoord);
            vec3 clipNormal = vec3(0.0);
            vec3 clipPosition = vec3(0.0);
            float clipAmount = 0.0;
            float pixelWidth = czm_metersPerPixel(position);
            for (int i = 0; i < 1000; ++i)
            {
                if (i >= clippingPlanesLength)
                {
                    break;
                }
                vec4 clippingPlanei = getClippingPlane(clippingPlanes, i, clippingPlanesMatrix, width, height);
                clipNormal = clippingPlanei.xyz;
                clipPosition = -clippingPlanei.w * clipNormal;
                float amount = dot(clipNormal, (position.xyz - clipPosition)) / pixelWidth;
                clipAmount = max(amount, clipAmount);
                clipped = clipped && (amount <= 0.0);
            }
            if (clipped)
            {
                discard;
            }
            return clipAmount;
        }
    #endif
        uniform highp sampler2D s3m_clippingPlanes;
        uniform mat4 s3m_clippingPlanesMatrix;
        uniform vec4 s3m_clippingPlanesEdgeStyle;
        uniform int s3m_width;
        uniform int s3m_height;
        uniform int s3m_clippingPlanesLength;
    #endif
    #ifdef clippingPolygon
        uniform highp sampler2D s3m_clippingPolygonsTexture;
        uniform mat4 s3m_toClippingPolygonsTexture;
    #endif
        void main()
        {
            vec4 color = getTextureColor() * vColor;
            gl_FragColor = czm_gammaCorrect(color);

        #ifdef clippingPlane
            float clipDistance = clip(gl_FragCoord, s3m_clippingPlanes, s3m_clippingPlanesMatrix, s3m_width, s3m_height, s3m_clippingPlanesLength);
            vec4 clippingPlanesEdgeColor = vec4(1.0);
            clippingPlanesEdgeColor.rgb = s3m_clippingPlanesEdgeStyle.rgb;
            float clippingPlanesEdgeWidth = s3m_clippingPlanesEdgeStyle.a;
            if (clipDistance > 0.0 && clipDistance < clippingPlanesEdgeWidth)
            {
                gl_FragColor = clippingPlanesEdgeColor;
            }
        #endif
        
        #ifdef clippingPolygon
            vec4 ec = czm_windowToEyeCoordinates(gl_FragCoord);
            vec4 wc = czm_inverseView * ec;
            wc /= wc.w;
            vec4 tc = s3m_toClippingPolygonsTexture * wc;
            vec2 tc2 = tc.xy/tc.w;
            if (tc2.x > 0.0 && tc2.x < 1.0 && tc2.y > 0.0 && tc2.y < 1.0)
            {
               vec4 color = texture2D(s3m_clippingPolygonsTexture, tc2);
               if (color.r > 0.0)
                {
                    discard;
                }
            }
        #endif
        }
    `
