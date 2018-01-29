/*global angular*/
/*jshint -W030 */


var sharedModule = angular.module("shared", []);
var techRegistryApp = angular.module("trApp.Main", ['ui.router', 'ngStorage', 'shared']);
var tRDashboardApp = angular.module("trApp.Dashboard", ['ui.router', 'ngStorage', 'ui.router.state.events', 'shared']);


techRegistryApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/main');

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('main', {
            url: '/main',
            templateUrl: 'App/ContentMaster/Content.html'
        });
}]);

tRDashboardApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.interceptors.push('AuthInterceptor');
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('home', {
                templateUrl: 'App/ContentMaster/DashboardContent.html'
            })
            .state('home.admin', {
                url: '/admin',
                template: '',
                controller: ['$rootScope',
                    function($rootScope, ) {
                        $rootScope.dashBoardTitle = "Admin";
                    }
                ]
            })
            .state('login', {
                url: '/login',
                templateUrl: 'App/User/Login.html'
            })
            .state('signup', {
                url: '/admin/signup',
                templateUrl: 'App/User/Registration.html'
            })
            .state('home.userController', {
                url: '/UserWidget',
                templateUrl: 'App/dashboardWidgets/userGrid.html',
                controller: ['$rootScope',
                    function($rootScope) {
                        $rootScope.dashBoardTitle = "User Controller";
                    }
                ]
            });



    }])
    .run(['$rootScope', '$state', '$localStorage', 'sharedService', '$location', function($rootScope, $state, $localStorage, sharedService, $location) {
        $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams, options) {
            debugger;
            sharedService.toggleLoader(true);
            if (toState.name == 'login' && $localStorage.currentUser) {
                if ($localStorage.currentUser.token) {
                    event.preventDefault();
                    $state.go('home');
                }
            }
            if (toState.name != 'login' && !$localStorage.currentUser) {
                $location.path('/login');
                //sharedService.toggleLoader(false);
            }
        });
        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams) {
                debugger;
                sharedService.toggleLoader(false);
            });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            debugger;
            sharedService.toggleLoader(false);
            event.preventDefault();
            $state.get('error').error = { code: 123, description: 'Exception stack trace' }
            return $state.go('error');
        });
    }]);
