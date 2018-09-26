import { expect } from 'chai'
import { mount, shallowMount } from '@vue/test-utils'
import App from '../../src/App.vue'
import Player from '../../src/components/Player.vue'

describe('App.vue', () => {

    it('includes title', () => {
        // assign things
        const wrapper = shallowMount(App, {
            propsData: { }
        })
        const status = wrapper.find('h1')
        expect(status.text()).to.include('State Race')
    })

    it('renders 3 players', () => {
        const wrapper = mount(App)
        const playerElements = wrapper.find(Player)
        expect(playerElements.length).to.equal(3)
        // const activePlayer = playerElements.find('.active')
    })

})