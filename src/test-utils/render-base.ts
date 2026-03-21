// /src/test-utils/render-base.ts

import { render } from "@testing-library/vue";
import type { RenderOptions } from "@testing-library/vue";
import { defineComponent, h, type Component } from "vue";

type GlobalPlugins = NonNullable<RenderOptions<object>["global"]>["plugins"];

export function renderBase<TProps extends object>(
  component: Component,
  defaults: TProps,
  overrides: Partial<TProps> = {},
  plugins?: GlobalPlugins,
) {
  return render(component, {
    props: {
      ...defaults,
      ...overrides,
    },
    global: {
      plugins,
    },
  });
}

interface RenderBaseWithProvidersOptions {
  providers?: Component[];
  slots?: Record<string, unknown>;
  plugins?: GlobalPlugins;
  events?: string[];
}

export function renderBaseWithProviders<TProps extends object>(
  component: Component,
  defaults: TProps,
  overrides: Partial<TProps> = {},
  options: RenderBaseWithProvidersOptions = {},
) {
  const { providers = [], slots = {}, plugins = [], events = [] } = options;

  if (providers.length === 0) {
    return renderBase(component, defaults, overrides, plugins);
  }

  // Wrap the component directly with providers and forward all events
  const WrappedComponent = defineComponent({
    name: "WrappedComponent",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: Object.keys(defaults) as any,
    setup(props, { attrs, emit }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventHandlers: Record<string, (...args: any[]) => void> = {};

      events.forEach(eventName => {
        const handlerName = eventName.includes(":")
          ? `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
          : `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventHandlers[handlerName] = (...args: any[]) =>
          emit(eventName, ...args);
      });

      return () =>
        providers.reduceRight(
          (child, Provider) => h(Provider, {}, { default: () => child }),
          h(component, { ...props, ...attrs, ...eventHandlers }, slots),
        );
    },
  });

  return render(WrappedComponent, {
    props: {
      ...defaults,
      ...overrides,
    },
    global: { plugins },
  });
}
