import Request from '../../mixins/Request'
import ConnectionService from '../../services/elasticsearch/ConnectionService'
import esAdapter from '@/mixins/GetAdapter'
import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'

export default {
  name: 'connect-base',
  mixins: [Request],
  data () {
    return {
      testError: false,
      testSuccess: false,
      testLoading: false,
      connectLoading: false,
      connectError: false,
      errorMessage: '',
      hostEqual: true
    }
  },
  computed: {
    elasticsearchHost: {
      get () {
        return this.$store.state.connection.elasticsearchHost
      },
      set (value) {
        this.connectError = false
        this.testError = false
        this.testSuccess = false
        this.testLoading = false
        this.hostEqual = false
        this.$store.commit('connection/setElasticsearchHost', value)
      }
    },
    hostValid () {
      return this.elasticsearchHost.match(/^https?:\/\//) ? true : 'Host most contain a valid scheme'
    }
  },
  methods: {
    resetElasticsearchHost () {
      this.elasticsearchHost = ''
    },
    testConnection () {
      this.testLoading = true
      this.testSuccess = false
      this.testError = false
      new ConnectionService(this.elasticsearchHost).testConnection()
        .then(() => {
          this.testLoading = false
          this.testSuccess = true
          this.testError = false
          showSuccessSnackbar({
            text: 'Test successfull',
            additionalText: 'You cluster is reachable and configured correctly.'
          })
        })
        .catch((e) => {
          this.testLoading = false
          this.testSuccess = false
          this.testError = true
          if (e instanceof TypeError) {
            this.errorMessage = 'Either your cluster is not reachable or you did not configure CORS correctly.'
          } else {
            this.errorMessage = e.message
          }
        })
    },
    connect () {
      this.connectLoading = true
      this.connectError = false
      esAdapter()
        .then(() => {
          this.$store.commit('connection/setConnected')
          this.connectLoading = false
          this.connectError = false
          showSuccessSnackbar({ text: 'Successfully connected.' })
          this.$router.push('/')
        })
        .catch(() => {
          this.connectLoading = false
          this.connectError = true
          showErrorSnackbar({ text: 'Error: could not connect.' })
        })
    }
  }
}
