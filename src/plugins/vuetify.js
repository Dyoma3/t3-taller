import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        light: true,
        themes: {
            light: {
                primary: '#4853fd',
                secondary: '#81eadc',
                ternary: '#9e74d0',
            }
        }
    }
});
