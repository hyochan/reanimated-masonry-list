import {
  NativeScrollEvent,
  RefreshControl,
  RefreshControlProps,
  ScrollViewProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import React, {MutableRefObject, ReactElement, memo, useState} from 'react';

import Animated from 'react-native-reanimated';

interface Props<T> extends Omit<ScrollViewProps, 'refreshControl'> {
  innerRef?: MutableRefObject<Animated.ScrollView | undefined>;
  loading?: boolean;
  refreshing?: RefreshControlProps['refreshing'];
  onRefresh?: RefreshControlProps['onRefresh'];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  style?: StyleProp<ViewStyle>;
  data: T[];
  renderItem: ({item: T, i: number}) => ReactElement;
  LoadingView?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponentStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  numColumns?: number;
  keyExtractor?: ((item: T | any, index: number) => string) | undefined;
}

const isCloseToBottom = (
  {layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent,
  onEndReachedThreshold: number,
): boolean => {
  const paddingToBottom = contentSize.height * onEndReachedThreshold;

  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

function MasonryList<T>(props: Props<T>): ReactElement {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const {
    refreshing,
    data,
    innerRef,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent,
    ListHeaderComponentStyle,
    containerStyle,
    contentContainerStyle,
    renderItem,
    onEndReachedThreshold,
    onEndReached,
    onRefresh,
    loading,
    LoadingView,
    numColumns = 2,
    horizontal,
    onScroll,
    keyboardShouldPersistTaps = 'handled',
    removeClippedSubviews = false,
    keyExtractor,
  } = props;

  const {style, ...propsWithoutStyle} = props;

  return (
    <Animated.ScrollView
      {...propsWithoutStyle}
      ref={innerRef}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      style={[{flex: 1, alignSelf: 'stretch'}, containerStyle]}
      contentContainerStyle={contentContainerStyle}
      removeClippedSubviews={removeClippedSubviews}
      refreshControl={
        <RefreshControl
          refreshing={!!(refreshing || isRefreshing)}
          onRefresh={() => {
            setIsRefreshing(true);
            onRefresh?.();
            setIsRefreshing(false);
          }}
        />
      }
      scrollEventThrottle={16}
      onScroll={(e) => {
        const nativeEvent: NativeScrollEvent = e.nativeEvent;
        if (isCloseToBottom(nativeEvent, onEndReachedThreshold || 0.1)) {
          onEndReached?.();
        }

        onScroll?.(e);
      }}
    >
      <View style={ListHeaderComponentStyle}>{ListHeaderComponent}</View>
      {data.length === 0 && ListEmptyComponent ? (
        React.isValidElement(ListEmptyComponent) ? (
          ListEmptyComponent
        ) : (
          <ListEmptyComponent />
        )
      ) : (
        <View
          style={[
            {
              flex: 1,
              flexDirection: horizontal ? 'column' : 'row',
            },
            style,
          ]}
        >
          {Array.from(Array(numColumns), (_, num) => {
            return (
              <View
                key={`masonry-column-${num}`}
                style={{
                  flex: 1 / numColumns,
                  flexDirection: horizontal ? 'row' : 'column',
                }}
              >
                {data
                  .map((el, i) => {
                    if (i % numColumns === num) {
                      return (
                        <View key={keyExtractor?.(el, i)}>
                          {renderItem({item: el, i})}
                        </View>
                      );
                    }

                    return null;
                  })
                  .filter((e) => !!e)}
              </View>
            );
          })}
        </View>
      )}
      {loading && LoadingView}
      {ListFooterComponent}
    </Animated.ScrollView>
  );
}

export default memo(MasonryList);
