var API_URL = SERVIDOR+'api/';
angular.module('starter')

.service('AuthService', function($q, $http, USER_ROLES, $rootScope,$ionicHistory, $ionicLoading, Usuario,jwtHelper){
  var LOCAL_TOKEN_KEY = 'AppUnicomerToken';
  var username = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;
  var pushToken = "1234";
  
  //var device = {uuid: '000000000', platform: 'dev-browser'}; //DESCOMENTAR PARA REALIZAR PRUEBAS EN NAVEGADOR

  function loadUserCredentials(){
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if(token){
      useCredentials(token);
    }
  };

  function storeUserCredentials(token){
    if (token === undefined ){
      destroyUserCredentials();
    }else{
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }
  };

  function getToken(){
    return window.localStorage.getItem(LOCAL_TOKEN_KEY);
  };
  function setTokenPush(token){
    pushToken = token;
  };

  function useCredentials(token){
    username = token.split('.')[0];
    isAuthenticated = true;
    authToken = token;

    if(username == 'admin'){
      role = USER_ROLES.admin
    }
    if(username == 'user'){
      role = USER_ROLES.public
    }
    // Set the token as header for your requests!
    $http.defaults.headers.common['X-Auth-Token'] = token;
    Usuario.setUser(token);
  };

  function destroyUserCredentials(){
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    delete $http.defaults.headers.common['X-Auth-Token'];
    $ionicHistory.clearCache();
  };

  var login = function(name, pw){
    return $q(function(resolve, reject){
        $rootScope.loading = $ionicLoading.show({
          template: 'Validando Usuario',
          showBackdrop: true
        });
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $http.post(SERVIDOR+"auth/login", { 
            "user" : name,
            "pass" : pw,
            "pushtoken" : pushToken,
            "uuid" : device.uuid,
            "type" : device.platform
        })
        .success(function(data) {
            if(data == false){
              $ionicLoading.hide();
              reject('Autentificación fallida');
            }else{
              storeUserCredentials(data.token);
              $ionicLoading.hide();
              resolve('Autentificación exitosa');
            }
        })
        .error(function(data) {
            $ionicLoading.hide();
            reject(data);
        });
    });
  };
  var updPasswd = function(password){
    return $q(function(resolve, reject){
        $rootScope.loading = $ionicLoading.show({
          template: 'Actualizando contraseña',
          showBackdrop: true
        });
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $http.post(API_URL+"actualizarpswd", { 
            "password" : password,
        })
        .success(function(data) {
            if(data == false){
              $ionicLoading.hide();
              reject('Actualización fallida');
            }else{
              $ionicLoading.hide();
              resolve('Actualización exitosa');
            }
        })
        .error(function(data) {
            $ionicLoading.hide();
            reject('Actualización fallida');
        });
    });
  };

  var logout = function(){
    $http.get(API_URL+"logout").success(function(){
      destroyUserCredentials();
    }).error(function(){
      destroyUserCredentials();
    })
  };
  var chkToken = function(){
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if(token){
      if(jwtHelper.isTokenExpired(token)) return false;
      useCredentials(token);
      return true;
    }else{
      return false;
    }
  };

  var isAuthorized = function(authorizedRoles){
    if(!angular.isArray(authorizedRoles)){
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  return {
    login : login,
    updPasswd: updPasswd,
    logout: logout,
    chkToken: chkToken,
    isAuthorized: isAuthorized,
    getToken : getToken,
    setTokenPush: setTokenPush,
    storeUserCredentials : storeUserCredentials,
    isAuthenticated: function(){return isAuthenticated;},
    username: function() {return username;},
    role: function(){return role;}
  };
})

.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS){
  return{
    responseError: function(response){
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
///new code

.factory("misNotificaciones", function($ionicLoading, $q, $http, $state,$filter, Usuario,AuthService){
    var misNotificaciones = [];
    var interfaz = {
        carga : function(){
          return misNotificaciones;
        },
        sync: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando notificaciones',
            showBackdrop: true
          });
          var currentUser = Usuario.getUser();
          $http.get(API_URL+"notificaciones")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              misNotificaciones = response.data;
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
              return misNotificaciones;
          });
          return deferred.promise;
        },
        getbyId : function(idObject){
          var single_object = $filter('filter')(misNotificaciones, function (d) {return d.idNotificacion === idObject;})[0];
          return single_object;
        }
    }
    return interfaz;
})

.factory("misActivaciones", function($ionicLoading,$filter, $http, $ionicPopup, $q, $state, Usuario,AuthService){
    var misActivaciones = [];
    var interfaz = {
        carga : function(){
          return misActivaciones;
        },     
        sync: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando activaciones',
            showBackdrop: true
          });
          var currentUser = Usuario.getUser();
          $http.get(API_URL+"activaciones")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              misActivaciones = response.data;
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
              return misActivaciones;
          });
          return deferred.promise;
        },       
         getbyId : function(idObject){
          var single_object = $filter('filter')(misActivaciones, function (d) {return d.idActivacion === idObject;})[0];
          return single_object;
        },   
    }
    return interfaz;
})



.factory("misComunicaciones", function($ionicLoading, $filter, $q, $http, $ionicPopup, $state, Usuario,AuthService){
    var misComunicaciones = [];
    var interfaz = {
        carga : function(){
          return misComunicaciones;
        },
        sync: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando Comunicados',
            showBackdrop: true
          });
          var currentUser = Usuario.getUser();
          $http.get(API_URL+"comunicados")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              misComunicaciones = response.data;
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
              return misComunicaciones;
          });
          return deferred.promise;
        },
        getbyId : function(idObject){
          var single_object = $filter('filter')(misComunicaciones, function (d) {return d.idComunicado === idObject;})[0];
          return single_object;
        }
    }
    return interfaz;
})

.factory("planVendedores", function($ionicLoading,$filter, $http, $state, $q, Usuario,AuthService){
    var incentivos = [];
    var currentUser = Usuario.getUser();
    var interfaz = {
        carga : function(){
          return incentivos;
        },
        getbyId : function(idObject){
          var single_object = $filter('filter')(incentivos, function (d) {return d.idPromo === idObject;})[0];
          return single_object;
        },

        sync: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando incentivos',
            showBackdrop: true
          });
          $http.get(API_URL+"incentivos")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              incentivos = response.data;
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
          });
          return deferred.promise;
        },

        ContenidoIncentivos: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando productos',
            showBackdrop: true
          });
          $http.get(API_URL+"incentivosContenido")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
          });
          return deferred.promise;
        },
        obtenerPuntos: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando Puntos',
            showBackdrop: true
          });
          $http.get(API_URL+"ventas")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
          });
          return deferred.promise;
        }
    }
    return interfaz;
})

.factory("misPromociones", function($ionicLoading, $http, $q, $filter,Usuario,AuthService){
    var Promociones = [];
    var currentUser = Usuario.getUser();
    var interfaz = {
        carga : function(){
          return Promociones;
        },
        getbyId : function(idObject){
          var single_object = $filter('filter')(Promociones, function (d) {return d.idPromocion === idObject;})[0];
          return single_object;
        },

        sync: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando Promociones',
            showBackdrop: true
          });
          $http.get(API_URL+"promociones")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              Promociones = response.data;
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
          });
          return deferred.promise;
        },

        Categorias: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando Categorías de Promociones',
            showBackdrop: true
          });
          $http.get(API_URL+"menuPromociones")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
          });
          return deferred.promise;
        }
    }
    return interfaz;
})

.factory("banner", function($ionicLoading, $http, $state, $q, Usuario,AuthService){
    var banner = [];
    var interfaz = {
        carga : function(){
          return banner;
        },
        sync: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando...',
            showBackdrop: true
          });
          var currentUser = Usuario.getUser();
          $http.get(API_URL+"banner")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              banner = response.data;
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
          });
          return deferred.promise;
        }
    }
    return interfaz;
})

.factory("contacto", function($ionicLoading, $q, $http, $state, Usuario,AuthService){
    var contacto = [];
    var interfaz = {
        carga : function(){
          return contacto;
        },
        sync: function(){
          var deferred = $q.defer();
          $ionicLoading.show({
            template: 'Cargando información...',
            showBackdrop: true
          });
          var currentUser = Usuario.getUser();
          $http.get(API_URL+"contacto")
          .success(function(response) {
              AuthService.storeUserCredentials(response.token);
              deferred.resolve(response.data);
              contacto = response.data;
              $ionicLoading.hide();
          })
          .error(function(response) {
              deferred.reject(response);
              $ionicLoading.hide();
          });
          return deferred.promise;
        }
    }
    return interfaz;
})

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])


//service code
.service('Usuario', function(jwtHelper) {
  return {
    info: {},
    getUser: function() {
      return this.info
    },
    setUser: function(token) {
      this.info = jwtHelper.decodeToken(token);
    }

  }
})

.config(function ($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptor');
});