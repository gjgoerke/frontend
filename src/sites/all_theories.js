const all_theories = {
  data: function() {
    return {
      loaded: false,
      orderByT: 'name',
      ascDescT: 'asc'
    }
  },
  mixins: [dashboardMixin],
  methods: {
    back: function() {
      router.go(-1);
    },
    ///////////////////
    // Sorting Stuff
    onSort: function(sortEvent) {
      this.orderByT = sortEvent[0];
      this.ascDescT = sortEvent[1];
      window.localStorage.setItem('strSortSettings', JSON.stringify({
        orderByT: this.orderByT,
        ascDescT: this.ascDescT
      }));
    },
    onTheoryClone: function(theory) {
      this.$emit('clone-theory', theory);
    },
    onDelete: function(theory) {
      this.$emit('delete-theory', theory);
      console.log('delete theory - swiper')
    },
    // Called on mount if applicable loads the users last sort settings.
    loadSortSettings: function() {
      let self = this;
      try {
        var strSortSettings = JSON.parse(window.localStorage.getItem('strSortSettings'));
        if(!!strSortSettings){
          self.ascDescT = strSortSettings.ascDescT;
          self.orderByT = strSortSettings.orderByT;
        }
      } catch(e) { }
    }
  },
  computed: {
    theoryRows: function() {
      return Math.ceil(this.orderedTheories(this.orderByT, this.ascDescT).length / 3);
    }
  },
  mounted: function() {
    this.loadSortSettings();
  },
  template: `
    <div class="container-fluid">

    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4" :class="{'show-small-nav': !showLargeNav}">

      <alert variant="danger" v-show="error" :dismissible="false">
        <span v-html="error"></span>
      </alert>

      <div v-if="theories">
        <a name="legislatures" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center my-4">
          <h3>Legislations</h3>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group mr-2">
              <button class="btn btn-sm btn-outline-primary" v-on:click="createTheory">
                <i data-feather="plus"></i>
                Create new
              </button>
            </div>
            <sort-button @order-by="onSort($event)"></sort-button>
          </div>
        </div>

        <loading-bar v-if="!loaded"></loading-bar>
        <div>
          <p v-if="theories.length == 0"><em>No legislatures formalized yet. Click on "create new" above,
          to create a new formalization or import a publicly available one.</em></p>
          <div class="row" v-for="i in theoryRows" style="margin-bottom: 2em">
            <div class="col-sm-4" v-for="t in orderedTheories(orderByT, ascDescT).slice((i-1) * 3, i * 3)">
              <theory-card v-bind:theory="t" :key="t._id" v-on:clone-theory="onTheoryClone($event)"></theory-card>
            </div>
          </div>
        </div>
      </div>

    </main>

      <sidebar v-on:show-large-nav="onShowLargeNav()" v-on:go-back="back">
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
  created: function() {
    nai.log('all_theories page created', '[App]');
    var self = this;
    nai.initDashboard(function(resp) {
      nai.log('User infos loaded', '[App]');
      nai.log(resp.data, '[App]');
      if (!!resp.data.data) {
        self.theories = resp.data.data.theories;
        self.queries = resp.data.data.queries;
        self.loaded = true;
      } else {
        nai.log('could not retrieve user data', '[App]');
      }
    }, nai.handleResponse(null, function(error) {
        self.loaded = true;
        self.error = `<b>Error</b>: Could not connect to NAI back-end.
                     Please try to reload and contact the system
                     administrator if this problem persists.`
        self.queries = null;
        self.theories = null;
      }, null))
  }
}
