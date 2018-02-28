/*global tRDashboardApp,$,angular,bootbox*/
var globalColData = {
    userGrid: [{ 'title': 'User Name', 'data': 'username' }, { 'title': 'Email', 'data': 'email' }],
    blogGrid: [{ 'title': 'Post Title', 'data': 'title' }, { 'title': 'Preview', 'data': 'previewText' }, { 'title': 'Related Tags', 'data': 'tagData' },
    {
        'title': 'Preview',
        'data': 'urlId',
        "render": function (data, type, row, meta) {
            return '<button ng-click="buttonEvent(&quot;blogGridPreview&quot;,&quot;' + data + '&quot;)">Preview</Button>';
        }
    },
    {
        'title': 'Delete',
        'data': '_id',
        "render": function (data, type, row, meta) {
            return '<button ng-click="buttonEvent(&quot;blogRowDelete&quot;,&quot;' + data + '&quot;)">Delete</Button>';
        }
    }
    ]
};

tRDashboardApp.directive('gridDirective', ['$localStorage', 'sharedService', '$state', '$compile', function ($localStorage, sharedService, $state, $compile) {
    return {
        restrict: 'E',
        templateUrl: 'Angular1/Directives/shared/Grid/Grid.html',
        scope: {
            gdId: '@',
            gridData: '=',
            gdType: '=',
            coloumnData: "@",
            ver: '='
        },
        compile: function (element, attributes) {

            sharedService.toggleLoader(true);
            element.find('table').attr('id', attributes.gdId);
        },
        controller: ['$scope', 'sharedService', '$http', '$compile', 'blogManagerService',
            function ($scope, sharedService, $http, $compile, blogManagerService) {

                var datatable;
                if ($scope.gdType == "URL") {
                    sharedService.callGetUrlTofetch($scope.gridData).then(function (resp) {
                        debugger;
                        datatable = $("#" + $scope.gdId).DataTable({
                            data: resp.data,
                            columns: globalColData[$scope.coloumnData],
                            createdRow: function (row, data, dataIndex) {
                                $compile(angular.element(row).contents())($scope);
                            }
                        });
                        sharedService.toggleLoader(false);
                    },
                        function (error) { });
                }

                $scope.buttonEvent = function (eventFor, data) {

                    switch (eventFor) {
                        case "blogGridPreview":
                            debugger;
                            $compile(' <blog-post-full url-id="' + data + '"></blog-post-full>')($scope, function (clonedElement, scope) {
                                var procDialog = bootbox.dialog({
                                    title: 'Blog Preview',
                                    message: $(clonedElement),
                                    closeButton: false,
                                    className:'ModalPreviewCls',
                                    buttons: {
                                        ok: {
                                            label: "Ok",
                                            className: 'btn-info',
                                            callback: function () {
                                                procDialog.modal('hide');
                                            }
                                        }
                                    }
                                });                       
                               
                            });

                        case "blogRowDelete":
                            blogManagerService.DeleteBlogRow({ id: data }).then(
                                function (resp) {

                                    sharedService.callGetUrlTofetch($scope.gridData).then(function (resp) {
                                        datatable.clear();
                                        datatable.rows.add(resp.data);
                                        datatable.draw();
                                    });
                                },
                                function (err) {

                                });
                            break;
                    }
                };

            }
        ]
    };
}]);
