const dashboard2 = {
  data: function() {
    return {
      dashboardLoaded: false
    }
  },
  mixins:[dashboardMixin],
  template:
  `
    <div  role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4" :class="{'show-small-nav': !showLargeNav}">
      <div class="container-fluid">
        <h1>Dashboard</h1>
        <hr>
        <control-panel></control-panel>
        <hr>
        <h4>Last Updated</h4>
        <swipe-component id="1" v-if="dashboardLoaded && !!theories" :theories="orderedTheories('lastUpdate', 'desc')"></swipe-component>
        <p v-if="theories.length == 0"><em>No legislatures formalized yet. Click on "create new" above,
        to create a new formalization or import a publicly available one.</em></p>
        <hr>
        <h4>Top Public Legislations</h4>
        <swipe-component class="mb-5" id="2" v-if="dashboardLoaded && !!theories" :theories="orderedTheories('lastUpdate', 'desc')"></swipe-component>
        <p v-if="theories.length == 0"><em>No public legislatures found.</em></p>
      </div>
      <sidebar v-on:show-large-nav="onShowLargeNav()">
        <template v-slot:returnToDashboard><span></span></template>
        <template v-slot:smallNavLinks>
            <li class="nav-item">
              <a class="nav-link" href="#legislatures">
                <i data-feather="book"></i>
              </a>
            </li>
        </template>
        <template v-slot:largeNavHeading>
          <span>Dashboard</span>
        </template>
        <template v-slot:largeNavLinks>
          <li class="nav-item">
            <a class="nav-link" href="#legislatures">
              <i data-feather="book"></i>
              My Legislations
            </a>
          </li>
          <ul class="list-unstyled mx-3 nav d-block">
            <li v-for="theory in orderedTheories('name','asc')">
            <a class="nav-link nav-link-hov" @click="openTheory(theory._id)" href="#">{{ theory.name }}</a>
              <ul class="list-unstyled ml-3">
                <li v-for="query in orderedQueries(theory)">
                  <a style="font-weight: 300; padding-top: 0; padding-bottom: 0;" class="nav-link nav-link-hov" @click="openQuery(query._id)" href="#">{{ truncatedName(query.name) }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </template>
      </sidebar>
    </div>
  `,
  created: function () {
    nai.log('Dashboard mounted', '[App]');
    var self = this;
    nai.initDashboard(function(resp) {
      nai.log('User infos loaded', '[App]');
      nai.log(resp.data, '[App]');
      if (!!resp.data.data) {
        self.theories = resp.data.data.theories;
        self.queries = resp.data.data.queries;
        self.dashboardLoaded = true;
      } else {
        nai.log('could not retrieve user data', '[App]');
      }
    }, nai.handleResponse(null, function(error) {
        self.dashboardLoaded = true;
        self.error = `<b>Error</b>: Could not connect to NAI back-end.
                     Please try to reload and contact the system
                     administrator if this problem persists.`
        self.queries = null;
        self.theories = null;
      }, null))
  }
}
