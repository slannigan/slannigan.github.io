var TextureManager = function() {
    this.textures = [];
    this.texturesOn = true;
    this.toggleTextures = false;

    this.vShader = "//VERTEX SHADER\n" +
        "varying vec2 vUv;\n" +
        "varying vec3 vecPos;\n" +
        "varying vec3 vecNormal;\n" +

        "uniform float textRepeatX;\n" +
        "uniform float textRepeatY;\n" +
        "uniform int textureOn;\n" +

        // https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/
        "void main() {\n" +
            "if (textureOn == 1) {\n" +
                "vUv = uv * vec2(textRepeatX, textRepeatY);\n" +
                // Since the light is on world coordinates,
                // I'll need the vertex position in world coords too
                // (or I could transform the light position to view
                // coordinates, but that would be more expensive)
                "vecPos = (modelMatrix * vec4(position, 1.0 )).xyz;\n" +
                // That's NOT exacly how you should transform your
                // normals but this will work fine, since my model
                // matrix is pretty basic
                "vecNormal = (modelMatrix * vec4(normal, 0.0)).xyz;\n" +
                "gl_Position = projectionMatrix *\n" +
                              "modelViewMatrix * vec4(position, 1.0 );\n" +
            "}\n" +
        "}\n";

    this.fShader = "//FRAGMENT SHADER\n" +
        "precision highp float;\n" +
         
        "varying vec2 vUv;\n" +
        "varying vec3 vecPos;\n" +
        "varying vec3 vecNormal;\n" +
         
        "uniform float color;\n" +
        "uniform sampler2D texture;\n" +
        "uniform int textureOn;\n" +
        "uniform int isBg;\n" +
         
        // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsLib.js
        "uniform vec3 ambientLightColor[MAX_POINT_LIGHTS];\n" +
        "uniform vec3 pointLightColor[MAX_POINT_LIGHTS];\n" +
        "uniform vec3 pointLightPosition[MAX_POINT_LIGHTS];\n" +
        "uniform float pointLightDistance[MAX_POINT_LIGHTS];\n" +
         
        "void main(void) {\n" +
            // Pretty basic lambertian lighting...
            "if (textureOn == 1) {\n" +
                "vec4 addedLights = vec4(0.0,0.0,0.0, 1.0);\n" +
                "for(int l = 0; l < MAX_POINT_LIGHTS; l++) {\n" +
                    "vec3 lightDirection = normalize(vecPos\n" +
                                          "-pointLightPosition[l]);\n" +
                    "addedLights.rgb += clamp(dot(-lightDirection,\n" +
                                             "vecNormal), 0.0, 1.0)\n" +
                                       "* pointLightColor[l];\n" +
                "}\n" +
                "for (int l = 0; l < MAX_POINT_LIGHTS; l++) {\n" +
                    "addedLights.rgb += ambientLightColor[l];\n" +
                "}\n" +

                "if (isBg == 1) {\n" +
                    "gl_FragColor = texture2D(texture, vUv);\n" +
                "}\n" +
                "else {\n" +
                    "gl_FragColor = texture2D(texture, vUv) * addedLights;\n" +
                "}\n" +
            "}\n" +
        "}\n";

    var self = this;

    document.addEventListener('keydown', function(e) {
        // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
        var unicode = e.keyCode? e.keyCode : e.charCode;

        if (unicode == 84) {      // 't' key
            self.toggleTextures = true;
        }
    });

    this.ImageLibrary = {
        face: THREE.ImageUtils.loadTexture('images/meatboy-face.png'),
        blood: THREE.ImageUtils.loadTexture('images/blood.png'),
        brick: THREE.ImageUtils.loadTexture('images/brick.png'),
        saw: THREE.ImageUtils.loadTexture('images/saw.png'),
        bg1: THREE.ImageUtils.loadTexture('images/bg1.png'),
        bg2: THREE.ImageUtils.loadTexture('images/bg2.png'),

        tail1: THREE.ImageUtils.loadTexture('images/bloodtail1.png'),
        tail2: THREE.ImageUtils.loadTexture('images/bloodtail2.png'),
        tail3: THREE.ImageUtils.loadTexture('images/bloodtail3.png'),
        tail4: THREE.ImageUtils.loadTexture('images/bloodtail4.png'),
        tail5: THREE.ImageUtils.loadTexture('images/bloodtail5.png'),
        tail6: THREE.ImageUtils.loadTexture('images/bloodtail6.png')
    }

    this.AnimationLibrary = {
        tail: [ 
                { 
                    texture: 'tail1', 
                    duration: 75 
                }, 
                { 
                    texture: 'tail2', 
                    duration: 75 
                },
                {
                    texture: 'tail3',
                    duration: 75
                },
                {
                    texture: 'tail4',
                    duration: 75
                },
                {
                    texture: 'tail5',
                    duration: 75
                },
                {
                    texture: 'tail6',
                    duration: 75
                }
            ]
    }

    _.each(this.ImageLibrary, function(texture) {
        texture.magFilter = THREE.NearestFilter;
    });
}

_.extend(TextureManager.prototype, {
    VerifyTexturesOn: function() {
        if (this.toggleTextures) {
            this.toggleTextures = false;
            this.texturesOn = !this.texturesOn;
            var self = this;
            _.each(this.textures, function(texture) {
                texture.material.uniforms.textureOn.value = self.texturesOn ? 1 : 0;
            })
        }
    },

    CreateTexture: function(planeSizeX, planeSizeY, textureImage, tile, textureSizeX, textureSizeY, isBg) {
        if (!_.isNumber(planeSizeX) || !_.isNumber(planeSizeY) ||
            !_.isString(textureImage) || !_.isBoolean(tile) ||
            !_.isNumber(textureSizeX) || !_.isNumber(textureSizeY)) {

            console.log("ERROR: TextureMapper had error with one of these arguments: " + 
                        planeSizeX + ", " + planeSizeY + ", " + textureImage + ", " + 
                        tile + ", " + textureSizeX + ", " + textureSizeY);
            return null;
        }

        var g = new THREE.PlaneBufferGeometry(planeSizeX, planeSizeY);

        var texture;
        if (!_.isUndefined(this.ImageLibrary[textureImage])) {
            texture = this.ImageLibrary[textureImage];
        }
        else {
            texture = THREE.ImageUtils.loadTexture(textureImage);
            texture.magFilter = THREE.NearestFilter;
        }

        var repeatX = 1, repeatY = 1;

        if (tile) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            if (textureSizeX == 0 || textureSizeY == 0) {
                console.log("ERROR: Texture can't have a size of zero");
                return null;
            }
            repeatX = planeSizeX/textureSizeX;
            repeatY = planeSizeY/textureSizeY;
        }

        var m = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib['lights'],
                {
                    color: {type: 'f', value: 0.0},
                    texture: {type: 't', value: null},
                    textRepeatX: {type: 'f', value: repeatX},
                    textRepeatY: {type: 'f', value: repeatY},
                    textureOn: {type: 'i', value: 1},
                    isBg: { type: 'i', value: isBg ? 1 : 0 }
                }
            ]),
            vertexShader: this.vShader,
            fragmentShader: this.fShader,
            transparent: true,
            lights: true
        });
        m.uniforms.texture.value = texture;

        var obj = new THREE.Mesh(g, m);
        this.textures.push(obj);
        return obj;
    }
});