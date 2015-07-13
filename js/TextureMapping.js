// var textures = [];
// var texturesOn = true;
// var toggleTextures = false;

// document.addEventListener('keydown', function(e) {
//     // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
//     var unicode = e.keyCode? e.keyCode : e.charCode;

//     if (unicode == 84) {      // 't' key
//         toggleTextures = true;
//     }
// });

var TextureManager = function() {
    this.textures = [];
    this.texturesOn = true;
    this.toggleTextures = false;

    this.vShader = document.getElementById('vertShader').text;
    this.fShader = document.getElementById('fragShader').text;

    var self = this;

    document.addEventListener('keydown', function(e) {
        // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
        var unicode = e.keyCode? e.keyCode : e.charCode;

        if (unicode == 84) {      // 't' key
            self.toggleTextures = true;
        }
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

        var texture = THREE.ImageUtils.loadTexture(textureImage);
        texture.magFilter = THREE.NearestFilter;

        // var repeat = THREE.Vector2(1,1);
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

// function RenderTextures() {
//     if (toggleTextures) {
//         toggleTextures = false;
//         texturesOn = !texturesOn;
//         _.each(textures, function(texture) {
//             texture.material.uniforms.textureOn.value = texturesOn ? 1 : 0;
//         })
//     }
// }

// Argument: vec2 planeSize, vec2 textureSize, image texture, bool tile
// Returns: polygon, or NULL if args are bad
// https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/
// var TextureMapper = function(planeSize, textureImage, tile, textureSize) {
// function TextureMapper(planeSizeX, planeSizeY, textureImage, tile, textureSizeX, textureSizeY, isBg) {
//     if (!_.isNumber(planeSizeX) || !_.isNumber(planeSizeY) ||
//         !_.isString(textureImage) || !_.isBoolean(tile) ||
//         !_.isNumber(textureSizeX) || !_.isNumber(textureSizeY)) {

//         console.log("ERROR: TextureMapper had error with one of these arguments: " + 
//                     planeSizeX + ", " + planeSizeY + ", " + textureImage + ", " + 
//                     tile + ", " + textureSizeX + ", " + textureSizeY);
//         return null;
//     }

//     var g = new THREE.PlaneBufferGeometry(planeSizeX, planeSizeY);

//     var texture = THREE.ImageUtils.loadTexture(textureImage);
//     texture.magFilter = THREE.NearestFilter;

//     // var repeat = THREE.Vector2(1,1);
//     var repeatX = 1, repeatY = 1;

//     if (tile) {
//         texture.wrapS = THREE.RepeatWrapping;
//         texture.wrapT = THREE.RepeatWrapping;
//         if (textureSizeX == 0 || textureSizeY == 0) {
//         	console.log("ERROR: Texture can't have a size of zero");
//         	return null;
//         }
//         repeatX = planeSizeX/textureSizeX;
//         repeatY = planeSizeY/textureSizeY;
//     }

//     var m = new THREE.ShaderMaterial({
//         uniforms: THREE.UniformsUtils.merge([
//             THREE.UniformsLib['lights'],
//             {
//                 color: {type: 'f', value: 0.0},
//                 texture: {type: 't', value: null},
//                 textRepeatX: {type: 'f', value: repeatX},
//                 textRepeatY: {type: 'f', value: repeatY},
//                 textureOn: {type: 'i', value: 1},
//                 isBg: { type: 'i', value: isBg ? 1 : 0 }
//             }
//         ]),
//         vertexShader: document.getElementById('vertShader').text,
//         fragmentShader: document.getElementById('fragShader').text,
//         transparent: true,
//         lights: true
//     });
//     m.uniforms.texture.value = texture;

//     var obj = new THREE.Mesh(g, m);
//     textures.push(obj);
//     return obj;
// }