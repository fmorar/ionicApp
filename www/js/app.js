//var SERVIDOR="http://201.205.255.86:8881/unicomer/administrador/"; //Contiene la direccion del servidor donde se va a conectar la app para tomar los datos y enviarlos
//var SERVIDOR="http://192.168.0.93:8080/unicomer/administrador/"; // DEBUG Contiene la direccion del servidor donde se va a conectar la app para tomar los datos y enviarlos
var SERVIDOR="http://smmcr.net/clientes/unicomer/administrador/"; // DEBUG Contiene la direccion del servidor donde se va a conectar la app para tomar los datos y enviarlos

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','angular-jwt','ionic-zoom-view'])

.run(function($ionicPlatform, $http, $state, $ionicPopup,AuthService,misNotificaciones) {
  $ionicPlatform.registerBackButtonAction(function (event) {
    if($state.current.name=="app.inicio" || $state.current.name=="login"){
      navigator.app.exitApp();
    }
    else {
      navigator.app.backHistory();
    }
  }, 100);

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)


    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    var push = PushNotification.init({
          android: {
              senderID: "968042063055"
          },
          ios: {
              alert: "true",
              badge: "true",
              sound: "true"
          },
          windows: {}
      });

      push.on('registration', function(data) {
          console.log(data);
          AuthService.setTokenPush(data.registrationId);
      });

      push.on('notification', function(data) {
        misNotificaciones.sync().then(function(){
          $state.go('app.notificaciones_detalles',{idNotificacion: data.additionalData.idnotify});
        })
        console.log(data);
      });

      push.on('error', function(e) {
      });
  });
})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider, USER_ROLES) {
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.backButton.previousTitleText(false).text('');

  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('loader', {
    url: '/loader',
    templateUrl: 'templates/loader.html',
    controller: 'loader'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'login'
  })

  .state('app.inicio', {
    url: '/inicio',
    views: {
      'menuContent': {
        templateUrl: 'templates/inicio.html',
        controller: 'inicio'
      }
    }
  })

  .state('app.comunicacion', {
    url: '/comunicacion',
    views: {
      'menuContent': {
        templateUrl: 'templates/comunicacion.html',
        controller: 'comunicacion'
      }
    }
  })

  .state('app.comunicacion_detalles', {
    url: '/comunicacion_detalles/:idComunicado',
    views: {
      'menuContent': {
        templateUrl: 'templates/detalleComunicado.html',
        controller: 'comunicacion_detalles'
      }
    }
  })

  .state('app.promociones_detalles', {
    url: '/promociones_detalles/:idPromocion',
    views: {
      'menuContent': {
        templateUrl: 'templates/detallePromocion.html',
        controller: 'promociones_detalles'
      }
    }
  })  

  .state('app.promociones', {
    url: '/promociones/:idCategoria',
    views: {
      'menuContent': {
        templateUrl: 'templates/promociones.html',
        controller: 'promociones'
      }
    }
  })

  .state('app.promociones_categorias', {
    url: '/promociones-categorias',
    views: {
      'menuContent': {
        templateUrl: 'templates/promociones_categorias.html',
        controller: 'promociones_categorias'
      }
    }
  })

  .state('app.activaciones', {
    url: '/activaciones/:idActivacion',
    views: {
      'menuContent': {
        templateUrl: 'templates/activaciones.html',
        controller: 'activaciones'
      }
    }
  })

  .state('app.notificaciones', {
    url: '/notificaciones',
    views: {
      'menuContent': {
        templateUrl: 'templates/notificaciones.html',
        controller: 'notificaciones'
      }
    }
  })

  .state('app.notificaciones_detalles', {
    url: '/notificaciones_detalles/:idNotificacion',
    views: {
      'menuContent': {
        templateUrl: 'templates/detalleNotificacion.html',
        controller: 'notificaciones_detalles'
      }
    }
  })

  .state('app.planVendedores', {
    url: '/planVendedores',
    views: {
      'menuContent': {
        templateUrl: 'templates/planVendedores.html',
        controller: 'planVendedores'
      }
    }
  })

  .state('app.enviarFactura', {
    url: '/enviarFactura',
    views: {
      'menuContent': {
      templateUrl: 'templates/enviarFactura.html',
      controller: 'enviarFactura',
      cache: false
      }
    }
  })

  .state('app.misPuntos', {
    url: '/misPuntos/:idPromo',
    views: {
      'menuContent': {
      templateUrl: 'templates/misPuntos.html',
      controller: 'misPuntosCtrl'
      }
    }
  })

  .state('app.verReglamento', {
    url: '/verReglamento/:idPromo',
    views: {
      'menuContent': {
      templateUrl: 'templates/verReglamento.html',
      controller: 'verReglamentoCtrl'
      }
    }
  })

  .state('app.contactenos', {
    url: '/contactenos',
    views: {
      'menuContent': {
        templateUrl: 'templates/contactenos.html',
        controller: 'contactenos'
      }
    }
  })

  .state('app.productosParticipantes', {
    url: '/productosParticipantes/:idPromo',
    views: {
      'menuContent': {
        templateUrl: 'templates/productosParticipantes.html',
        controller: 'productosParticipantes'
      }
    }
  })

  .state('app.contenidoIncentivos', {
    url: '/contenidoIncentivos/:idPromo',
    views: {
      'menuContent': {
        templateUrl: 'templates/contenidoIncentivos.html',
        controller: 'contenidoIncentivos'
      }
    }
  });
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/loader');
})

.run(function ($rootScope, $state,$location, AuthService, AUTH_EVENTS,jwtHelper) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }

    console.log(AuthService.isAuthenticated());
 
    if (!AuthService.isAuthenticated()) {
      var publicViews = ['login','loader'];
      if (publicViews.indexOf(next.name) < 0 ){
        event.preventDefault();
        $state.go('login');
      }
    }
  });
});