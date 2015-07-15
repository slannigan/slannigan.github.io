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