const eventBus = new Vue();

///////////
// Mixin for theory delete/clone etc on the dash and alltheories pages.
//////////

const dashboardMixin = {
  data: function() {
    return {
      showLargeNav: false,
      theories: [],
      queries: [],
      error: null
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
      console.log('onTheoryDelete()'); // XX
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
      console.log('Theory Delete Error') // XX
      nai.handleResponse()(error)
    },
    onTheoryClone: function(theory) {
      console.log('onTheoryClone() (mixin)'+theory) // XX
      nai.cloneTheory(theory, this.onTheoryCloneSuccess(theory), this.onTheoryCloneError);
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
    onCloneModalFinish: function() {
      nai.log("modal finish");
      this.showModal = false;
    },
    onCloneModalCancel: function() {
      nai.log("modal cancel");
      this.showModal = false;
    },
    onShowLargeNav: function() {
      this.showLargeNav = !this.showLargeNav;
    },
    // Note that these order functions are used in different contexts and have different arguments.
    orderedTheories: function(orderBy, ascDesc) {
      return _.orderBy(this.theories, orderBy, ascDesc);
    },
    orderedQueries: function(theory) {
      return _.orderBy(theory.queries, 'name', 'asc');
    },
    truncatedName: function(name) {
      return _.truncate(name, {'length': 22, 'separator': ' '});
    },
    openTheory: function(theoryId) {
      router.push('/theory/'+theoryId);
    },
    openQuery: function(queryId) {
      router.push('/query/'+queryId);
    }
  },
  created: function() {
    this.$on('delete-theory', this.onTheoryDelete);
    this.$on('clone-theory', this.onTheoryClone); // XX
    this.$on('delete-query', this.onQueryDelete);
    this.$on('modal-ok', this.onCloneModalFinish);
    this.$on('modal-cancel', this.onCloneModalCancel);
  },
  mounted: function() {
    feather.replace();
  }
};
