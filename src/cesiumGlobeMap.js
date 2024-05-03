import * as Cesium from 'cesium';

// const buildings = await Cesium.createGooglePhotorealistic3DTileset(); // google removes all the other effects
const buildings = await Cesium.createOsmBuildingsAsync();

// const terrainProvider = await Cesium.createWorldTerrainAsync({
//     requestWaterMask: false
// });

const maximumZoomDistance = 10000000;
const selectedImagery = [
    'Bing Maps Aerial with Labels',
    'Open­Street­Map'
];

export function createGlobeMap(id) {
    const viewer = new Cesium.Viewer(id, {
        geocoder: true, // search
        homeButton: false,
        shouldAnimate: true, // move time
        animation: false, // time interface
        sceneModePicker: false,
        baseLayerPicker: true,
        // terrainProvider: terrainProvider,
        terrain: Cesium.Terrain.fromWorldTerrain({ requestWaterMask: false }),
        navigationHelpButton: false,
        timeline: false,
        fullscreenButton: false,
        // baseLayer: new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider())
        // baseLayer: new Cesium.ImageryLayer(new Cesium.BingMapsImageryProvider({
        //     mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS
        // }))
    });

    // limit imagery layer options
    const imageryProviderViewModels = viewer.baseLayerPicker.viewModel.imageryProviderViewModels.filter(model => {
        return selectedImagery.includes(model.name);
    }).map(model => {
        return new Cesium.ProviderViewModel({
            name: model.name,
            tooltip: model.tooltip,
            iconUrl: model.iconUrl,
            creationFunction: model._creationCommand
        });
    });
    viewer.baseLayerPicker.viewModel.imageryProviderViewModels = imageryProviderViewModels;
    viewer.baseLayerPicker.viewModel.selectedImagery = imageryProviderViewModels[0];
    viewer.baseLayerPicker.viewModel.terrainProviderViewModels = [];

    // globe lighting
    viewer.scene.globe.enableLighting = true;

    // nighttime lights
    const blackMarble = Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(3812), {
        maximumTerrainLevel: 5, // level to disappear
        // minimumTerrainLevel: 5 // level to appear
    });
    blackMarble.brightness = 2.0;
    blackMarble.nightAlpha = 0.5;
    blackMarble.dayAlpha = 0;
    viewer.scene.imageryLayers.add(blackMarble);

    // zoom limits
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = maximumZoomDistance;
    viewer.scene.screenSpaceCameraController._zoomFactor = 4;

    // set initial camera height
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(viewer.camera.positionCartographic.longitude, viewer.camera.positionCartographic.latitude, maximumZoomDistance),
        duration: 0
    });

    // buildings
    viewer.scene.primitives.add(buildings);
}
