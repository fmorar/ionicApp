angular.module('starter.controllers', ['ngCordova'])

.controller('loader', function(AuthService,$state,$ionicHistory,misActivaciones,misNotificaciones,misPromociones,misComunicaciones,planVendedores,contacto){
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  if(AuthService.chkToken()){
    misPromociones.sync();
    misComunicaciones.sync();
    misActivaciones.sync();
    misNotificaciones.sync();
    planVendedores.sync();
    contacto.sync();
    $state.go('app.inicio');
  }else{
    $state.go('login');
  }
})
.controller('AppCtrl', function($scope, $ionicModal,$location, $timeout, $state, $ionicPopup, Usuario, misComunicaciones, banner, misNotificaciones, misPromociones, misActivaciones, planVendedores, contacto, AuthService, AUTH_EVENTS) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Sesión expirada!',
      template: 'Lo sentimos, debe ingresar nuevamente.'
    });
  });

  $scope.logout = function(){
    AuthService.logout();
    $location.path('/login')
  };
  $scope.comunicacion = function(){
    misComunicaciones.sync().then(function(){
      $state.go('app.comunicacion');
    })
  };

  $scope.promociones = function(){
    misPromociones.sync().then(function(){
      $state.go('app.promociones_categorias');
    })
  };

  $scope.activaciones = function(){
    misActivaciones.sync().then(function(){
      $state.go('app.activaciones');
    })
  };

  $scope.notificaciones = function(){
    misNotificaciones.sync().then(function(){
      $state.go('app.notificaciones');
    })
  }; 

  $scope.planVendedores = function(){
    planVendedores.sync().then(function(){
      $state.go('app.planVendedores');
    })
  };

  $scope.contacto = function(){
    contacto.sync().then(function(){
      $state.go('app.contactenos');
    })
  };  

  $scope.logo = '';
  $scope.$on('$ionicView.beforeEnter', function(){
    var currentUser = Usuario.getUser();
    if(currentUser.idTienda == 1){
      $scope.logo = 'logo_gollo.png';
    }else if(currentUser.idTienda == 2){
      $scope.logo = 'logo_curacao.png';
    }else{
      $scope.logo = 'logo.png';
    }
  });
  
  $scope.openExternal = function(link){
    window.open(link, '_system', 'location=yes');
  }
  
})

.controller('login', function($ionicHistory,$scope, $state, $ionicPopup,$timeout,$location, AuthService, Usuario) {
  $scope.data = {};
  $ionicHistory.clearHistory();
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.logout = function(){
    AuthService.logout();
    $location.path('/login')
  };

  $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      var currentUser = Usuario.getUser();
      if (currentUser.TempPass == 1){
      var pswdReq = /(?=^[A-Z])(?=.{1,4}\d)(?=.*[A-Za-z])[A-Za-z\d]{8,}/;
      $scope.data = {invalidpswd:false,newpassword:'',invalidconfirmpswd:false};
      $scope.testPswd = function(){
        if (pswdReq.test($scope.data.newpassword)){
          var psw = $scope.data.newpassword;
          if (psw.length >= 9){
            $scope.data.invalidpswd = false;
          }else{
            $scope.data.invalidpswd = true;
          }
        }else{
          $scope.data.invalidpswd = true;
        }
      }

      $scope.testConfirmPswd = function(){
        if ($scope.data.newpassword != $scope.data.confirm_password ){
          $scope.data.invalidconfirmpswd = true;
        }else{
          $scope.data.invalidconfirmpswd = false;
        }
      }

      var myPopup = $ionicPopup.show({
          templateUrl: 'templates/changePswd.html',
          title: 'Contraseña temporal',
          subTitle: 'Para continuar debe cambiar su contraseña, <br/> * El primer dígito siempre tiene que ser una letra y estar en Mayuscula. <br/>* Dentro de los primeros 5 dígitos debe haber un número.<br/> * No se permiten caracteres especiales. <br/> * Longitud mínima: 9 caractéres',
          scope: $scope,
          buttons: [{
              text: '<b>Aceptar</b>',
              type: 'button-positive',
              onTap: function(e) {
                $scope.testPswd();
                $scope.testConfirmPswd();
                if ($scope.data.invalidpswd || $scope.data.invalidconfirmpswd) {
                  e.preventDefault();
                }else{
                  AuthService.updPasswd($scope.data.newpassword).then(function(){
                    myPopup.close();
                    $ionicPopup.alert({
                       title: 'Atención',
                       template: 'Se ha cambiado su contraseña correctamente, por favor vuelva a ingresar con las nuevas credenciales.'
                     });
                    $scope.logout();
                  }).catch(function(error){
                      $ionicPopup.alert({
                       title: 'Error!',
                       template: 'No se pudo actualizar la contraseña, intente nuevamente'
                     });
                  })
                }
              }
            }
          ]
        });
    }else{
      $state.go('app.inicio', {}, {reload: true});
    }

    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Autentificación fallida!',
        template: err
      });
    });
  };
})

.controller('comunicacion_detalles', function($scope, $stateParams,$ionicPopup, $cordovaFileTransfer,$ionicLoading, $cordovaFileOpener2, $state, misComunicaciones, $timeout, Usuario){
  $scope.currentUser = Usuario.getUser();
  $scope.Comunicados = {};
  $scope.Comunicados = misComunicaciones.getbyId($stateParams.idComunicado);
  console.warn('ASDASDSA');
  
// File for download
 $scope.descargar = function (fileSys) {

  //Get file
  var url = fileSys;
  // File name only
  var filename = url.split("/").pop();
  // Save location
  var targetPath = cordova.file.externalRootDirectory+filename;
  $ionicLoading.show({
            template: 'Descargando...',
            showBackdrop: true
  });
  $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
          var TypeMine = url.split(".").pop();
          var openFile;

            switch(TypeMine) {
              case "ppt":
                if(TypeMine == "ppt" || "pptx"){
                  openFile='application/vnd.openxmlformats-officedocument.presentationml.presentation';
                }
                break;
              case "pdf":
                if(TypeMine == "pdf"){
                  openFile='application/pdf';
                }        
                break;
              case "word":
                if(TypeMine == "docx"){
                  openFile='application/msword';
                }        
                break;
              default:
              console.log("El formato del archivo no es permitido");    
          }
            $cordovaFileOpener2.open(
              targetPath, openFile
            ).then(function() {
                // Success!
            }, function(err) {
                var alertPopup = $ionicPopup.alert({
                  title: 'Error',
                  template: 'Su visor de pdf no es compatible por favor descargar adobe reader'
              });
            });
            $ionicLoading.hide();
    }, function (error) {
       console.log('Error status: ' + e.status + ' - Error message: ' + e.message);

    }, function (progress) {
      console.log('file opened successfully');
  });

  }
})

.controller('comunicacion', function($scope, misComunicaciones, $timeout, Usuario) {
  $scope.Comunicados = [];
  $scope.Comunicados = misComunicaciones.carga();
  $scope.comunicadoSeleccion;


  $scope.verComunicado = function(comunicado) {
    $scope.comunicadoSeleccion = comunicado;
  };
})

.controller('promociones_categorias', function($scope, $stateParams, $state, misPromociones, $timeout, Usuario){
  $scope.currentUser = Usuario.getUser();
  $scope.Promociones = [];
  $scope.promoSeleccion;
  misPromociones.Categorias().then(function(result){
    $scope.Promociones = result;
  });
  $scope.getPromos = function(idTipoCategoria){
    $state.go('app.promociones',{'idCategoria': idTipoCategoria});
  }
})

.controller('promociones_detalles', function($scope, $stateParams, $state, misPromociones, $timeout, Usuario){
  $scope.currentUser = Usuario.getUser();
  $scope.Promociones = {};
  $scope.Promociones = misPromociones.getbyId($stateParams.idPromocion);
})

.controller('promociones', function($scope, $stateParams, misPromociones, $timeout, Usuario){

  $scope.currentUser = Usuario.getUser();
  $scope.categoria = $stateParams.idCategoria;
  $scope.detalle = $stateParams.idPromocion;
  $scope.Promociones = [];
  $scope.Promociones = misPromociones.carga();
  $scope.promoSeleccion;
  $scope.chkidCat = function(){
    return function( item ) {
      return item.idTipo === $stateParams.idCategoria;
    };
  }

  $scope.verPromocion = function(promo) {
    $scope.promoSeleccion = promo;
  };
    
})

////////////////////////////////////plan de vendedores //////////////////////////////////////////////////

.controller('productosParticipantes', function($scope,$stateParams, planVendedores, $timeout, Usuario){
    $scope.currentUser = Usuario.getUser();
    $scope.incentivos = [];

  planVendedores.ContenidoIncentivos().then(function(result){
    $scope.incentivos = result;
  });
  $scope.getProductos = function(idPromo){
    $state.go('app.productosParticipantes',{'idPromo': idPromo});
  }

    $scope.chkidCat = function(){
    return function( item ) {
      return item.idPromo === $stateParams.idPromo;
    };
  }

})

.controller('contenidoIncentivos', function($scope, planVendedores, $stateParams, $timeout, Usuario){
    $scope.incentivo = {};
    $scope.incentivo = planVendedores.getbyId($stateParams.idPromo);
})

.controller('planVendedores', function($scope, planVendedores, $timeout, Usuario){
  $scope.incentivos = [];
  $scope.incentivos = planVendedores.carga();
})

.controller('verReglamentoCtrl', function($scope, $stateParams, planVendedores, $timeout, Usuario){
    $scope.incentivo = {};
    $scope.incentivo = planVendedores.getbyId($stateParams.idPromo);

})
.controller('misPuntosCtrl', function($scope, $stateParams,$ionicPopup, planVendedores, $timeout, Usuario){
    $scope.currentUser = Usuario.getUser();
    $scope.incentivo = {};
    $scope.incentivo = planVendedores.getbyId($stateParams.idPromo);

    $scope.misPuntos = [];
      planVendedores.obtenerPuntos().then(function(result){
      $scope.misPuntos = result;
    });

$scope.verFacruras = function(idPromo) {
    // An elaborate, custom popup
    $scope.incentivo = planVendedores.getbyId($stateParams.idPromo);
    var myPopup = $ionicPopup.show({
      title: 'Facturas',
      templateUrl: 'facturas.html',
      scope: $scope,
      buttons: [
        { text: 'Cerrar',
          type: 'button-dark button-small'
        }
      ]
    });
  }
})

////////////////////////////////////Activaciones //////////////////////////////////////////////////

.controller('activaciones', function($scope, $stateParams,$filter, misActivaciones, $ionicModal, $ionicScrollDelegate, Usuario){
  $scope.Activaciones = [];
  misActivaciones.sync().then(function(result){
    $scope.Activaciones = result;
    if ($stateParams.idActivacion){
      var activacion = misActivaciones.getbyId($stateParams.idActivacion);
                  if(activacion){
                    $scope.verActivacion(activacion);
                  }      
    }    
  });
  $scope.ActivacionSeleccion;
  
  $scope.f1;

  $ionicModal.fromTemplateUrl('detalleActivacion.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });


  $scope.filtrarMes = function(fecha){
    $scope.f1 = $filter('date')(fecha, "MM-yyyy");
    $ionicScrollDelegate.scrollTop();
  }
 $scope.verActivacion = function(activacion) {
    $scope.ActivacionSeleccion = activacion;
    $scope.modal.show();
  };
})

.controller('notificaciones_detalles', function($scope, $stateParams, $state, misNotificaciones, $timeout, Usuario){
  $scope.currentUser = Usuario.getUser();
  $scope.Notificacion = {};
  $scope.Notificacion = misNotificaciones.getbyId($stateParams.idNotificacion);
})

.controller('notificaciones', function($scope, $stateParams, misNotificaciones, Usuario){
  $scope.Notificaciones = [];
  $scope.Notificaciones = misNotificaciones.carga();
  $scope.notificacionSeleccion;

  $scope.verNotificacion = function(notificacion) {
    $scope.notificacionSeleccion = notificacion;
    $scope.showPopup();
  };
})

.controller('contactenos', function($scope, $stateParams, Usuario, contacto){


  $scope.contacto = [];
  $scope.contacto = contacto.carga();
  $scope.contactoSeleccion;

  $scope.verContacto = function(contacto) {
    $scope.contactoSeleccion = contacto;
  };
})

.controller('inicio', function($scope,$location, $stateParams,$ionicHistory,$ionicSlideBoxDelegate, banner, Usuario){
  var currentUser = Usuario.getUser();
  $scope.banners = [];
  banner.sync().then(function(result){
    $scope.banners = result;
    $ionicSlideBoxDelegate.update();
  });
  $scope.bannerSeleccion;
  $scope.bannerSeleccion = banner;
  $scope.enlace = function(interno,externo){
      if (interno){
        $location.path('/app/'+interno);
      }else if(externo){
        $scope.openExternal(externo);
      }
  }
})

