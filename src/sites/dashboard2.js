const dashboard2 = {
  data: function() {
    return {
      dashboardLoaded: false,
      theories: [],
      queries: [],
      error: null,
      showLargeNav: false,
    }
  },
  methods: {
    createTheory: function() {
      nai.createFreshTheory(this.onTheoryCreateSuccess, this.onTheoryCreateFail);
    },
    onTheoryCreateSuccess: function(resp) {
      nai.log('Theory created', '[App]');
      nai.log(resp, '[App]');
      if (!!resp.data) {
        var id = resp.data.data._id;
        router.push({ path: '/theory/'+id, query: { edit: true } })
      } else {
        // error handling, unexpected return
        nai.log('theory creation failed', '[App]')
      }
    },
    onTheoryCreateFail: function(error) {
      console.log(error)
    },
    onTheoryDelete: function(theory) {
      console.log('onTheoryDelete()');
      nai.deleteTheory(theory, this.onTheoryDeleteSuccess(theory), this.onTheoryDeleteError)
    },
    onTheoryDeleteSuccess: function(theory) {
      var self = this
      return function(resp) {
        // reflect update locally
        self.theories.splice(self.theories.indexOf(theory),1)
        nai.log('Theory ' + theory.name + ' deleted', '[App]');
      }
    },
    onTheoryDeleteError: function(error) {
      nai.handleResponse()(error)
    },
    onTheoryClone: function(theory) {
      nai.cloneTheory(theory, this.onTheoryCloneSuccess(theory), this.onTheoryCloneError)
    },
    onTheoryCloneSuccess: function(theory) {
      var self = this
      return function(resp) {
        nai.log('Theory created', '[App]');
        nai.log(resp, '[App]');
        if (!!resp.data) {
          var newTheory = {
            name: theory.name + " (Clone)",
            description: theory.description,
            _id: resp.data.data.theory._id,
            lastUpdate: new Date()
          };
          self.theories.push(newTheory);
        } else {
          // error handling, unexpected return
          nai.log('unexpected theory creation response', '[App]')
        }
      }
    },
    onTheoryCloneError: function(error) {
      nai.handleResponse()(error)
    },
    ////////////////////////////////////////////////
    // Query stuff
      // moved to theory-card
    /////////////////////
    /////////////////////
    onCloneModalFinish: function() {
      nai.log("modal finish");

      this.showModal = false;
    },
    onCloneModalCancel: function() {
      nai.log("modal cancel");
      this.showModal = false;
    },
    showTheoryCloneWindows: function() {
      //this.showModal = true;
    },
    onShowLargeNav: function() {
      this.showLargeNav = !this.showLargeNav;
    },
    orderedTheories: function() {
      return _.orderBy(this.theories, 'lastUpdate', 'desc');
    },
    openTheory: function(theoryId) {
      router.push('/theory/'+theoryId);
    },
    openQuery: function(queryId) {
      router.push('/query/'+queryId);
    }

  },
  template:
  `
    <div class="dash-outer-container" :class="{'show-large-nav': showLargeNav, 'show-small-nav': !showLargeNav}">
      <div class="container-fluid dash-inner-container">
        <h1>Dashboard</h1>
        <hr>
          <control-panel></control-panel>
        <hr>
        <h4>Last Updated</h4>
        <swipe-component id="1" v-if="dashboardLoaded && !!theories" :theories="orderedTheories()" :queries="queries"></swipe-component>
        <hr>
        <h4>Top Public Legislations</h4>
        <swipe-component id="2" v-if="dashboardLoaded && !!theories" :theories="orderedTheories()" :queries="queries"></swipe-component>
      </div>
      <sidebar v-on:show-large-nav="onShowLargeNav()">
        <template v-slot:returnToDashboard><span></span></template>
        <template v-slot:smallNavLinks>
            <li class="nav-item">
              <a class="nav-link" href="#legislatures">
                <feather-icon icon="book"></feather-icon>
              </a>
            </li>
        </template>
        <template v-slot:largeNavHeading>
          <span>Dashboard</span>
        </template>
        <template v-slot:largeNavLinks>
          <li class="nav-item">
            <a class="nav-link" href="#legislatures">
              <feather-icon icon="book"></feather-icon>
              My Legislations
            </a>
          </li>
          <ul class="list-unstyled mx-3 nav">
            <li v-for="theory in theories">
            <a class="nav-link nav-link-hov" @click="openTheory(theory._id)" href="#">{{ theory.name }}</a>
              <ul class="list-unstyled ml-3">
                <li v-for="query in theory.queries">
                  <a style="font-weight: 300; padding-top: 0; padding-bottom: 0;" class="nav-link nav-link-hov" @click="openQuery(query._id)" href="#">{{ query.name }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </template>
      </sidebar>
    </div>
  `,
  created: function () {
    this.$on('delete-theory', this.onTheoryDelete);
    this.$on('clone-theory', this.onTheoryClone);
    this.$on('delete-query', this.onQueryDelete);
    this.$on('modal-ok', this.onCloneModalFinish);
    this.$on('modal-cancel', this.onCloneModalCancel);
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
