import type { MountingOptions } from "@vue/test-utils";
import { mount } from "@vue/test-utils";
import type { Component } from "vue";
import { defineComponent, h } from "vue";

interface MountWithProvidersOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, unknown>;
  providers?: Component[]; // optional array of providers
  mountOptions?: MountingOptions<unknown>; // any extra options to pass to mount
}

export function mountWithProviders<T extends Component>(
  component: T,
  options: MountWithProvidersOptions = {},
) {
  const { props, slots, providers = [], mountOptions } = options;

  return mount(
    defineComponent({
      render() {
        // recursively wrap component with providers
        const content = providers.reduceRight(
          (child, provider) => h(provider, {}, { default: () => child }),
          h(component, props || {}, slots || {}),
        );

        return content;
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mountOptions as any,
  );
}
