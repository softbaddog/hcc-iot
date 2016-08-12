/**
 * Created by Administrator on 2016/5/3.
 */
var LHF_WEBGL=LHF_WEBGL||{};
LHF_WEBGL.InitThree=function(canvas_,w_,h_,fov_,near_,far_,anitialias){
    var scope=this;
    //基本构造
    this.main_camera;
    this.main_scene;
    this.main_renderer;

    this.main_scene = new THREE.Scene();
    this.main_camera = new THREE.PerspectiveCamera(fov_, w_ / h_, near_, far_);
    this.main_renderer = new THREE.WebGLRenderer({antialias: false,canvas:canvas_});

    this.main_renderer.setSize(w_, h_);

    var clock = new THREE.Clock();
    var composer = new THREE.EffectComposer(this.main_renderer);
    composer.renderTarget1.stencilBuffer = true;
    composer.renderTarget2.stencilBuffer = true;


    //scene renderpass
    var sceneRenderPass_=new THREE.RenderPass(this.main_scene,this.main_camera);
    this.sceneRenderPass=sceneRenderPass_;

    var bloomPass=new THREE.BloomPass(1,25,5,1024);
    bloomPass.renderToScreen=true;

    var fxaa=new THREE.ShaderPass(THREE.FXAAShader);
    fxaa.uniforms.resolution.value.x=1/1920;
    fxaa.uniforms.resolution.value.y=1/1080;
    fxaa.renderToScreen=true;

    /*
    var smaapass=new THREE.SMAAPass(w_,h_);
    smaapass.renderToScreen=true;
    */
    /*
    this.resolutChange=function(){
        fxaa.uniforms.resolution.value.x=1/HCC_LIGHTS.effectController.resolutionx;
        fxaa.uniforms.resolution.value.y=1/HCC_LIGHTS.effectController.resolutiony;
        scope.starAmbient_.intensity=HCC_LIGHTS.effectController.StatelitesIntensity;
    }
    HCC_LIGHTS.effectController.resolutionx=1920;
    HCC_LIGHTS.effectController.resolutiony=1080;
    HCC_LIGHTS.effectController.StatelitesIntensity=1;
    HCC_LIGHTS.gui.add(HCC_LIGHTS.effectController, "resolutionx",1,4096,1920).onChange(this.resolutChange);
    HCC_LIGHTS.gui.add(HCC_LIGHTS.effectController, "resolutiony",1,2048,1080).onChange(this.resolutChange)
    HCC_LIGHTS.gui.add(HCC_LIGHTS.effectController, "StatelitesIntensity",0.0,10,1).onChange(this.resolutChange)
    */
    //effect com
    composer.addPass(sceneRenderPass_);//场景渲染
    composer.addPass(bloomPass);//飞船特定效果
    composer.addPass(fxaa);//输出

    this.onWindowResize=function(w_,h_){
        fxaa.uniforms.resolution.value.x=1/w_;
        fxaa.uniforms.resolution.value.y=1/h_;
    }

    this.enterframe=function(){};
    //var delta;
    this.render=function(){

        var delta = clock.getDelta();
        requestAnimationFrame(scope.render);
        scope.enterframe();

        scope.main_renderer.autoClear = false;
        scope.main_renderer.clear();
        composer.render(delta);
    }
}
