// src/test-utils/mount-with-providers.ts
import { h, defineComponent, Component } from 'vue';
import { mount, MountingOptions } from '@vue/test-utils';

interface MountWithProvidersOptions {
    props?: Record<string, any>;
    slots?: Record<string, any>;
    providers?: Component[]; // optional array of providers
    mountOptions?: MountingOptions<any>; // any extra options to pass to mount
}

export function mountWithProviders<T extends Component>(
    component: T,
    options: MountWithProvidersOptions = {}
) {
    const { props, slots, providers = [], mountOptions } = options;

    return mount(
        defineComponent({
            render() {
                // recursively wrap component with providers
                const content = providers.reduceRight(
                    (child, provider) => h(provider, {}, { default: () => child }),
                    h(component, props || {}, slots || {})
                );

                return content;
            },
        }),
        mountOptions as any
    );
}
