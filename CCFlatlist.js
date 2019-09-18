
import React, { PureComponent } from "react";
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    Dimensions,
    Image,
    ActivityIndicator
} from "react-native";
import PropTypes from 'prop-types';

const { width, height } = Dimensions.get('window');

const SHOWFOOT = {
    ALLOWED:1,
    DONTSHOW:0,
    LOADING:2
}
export default class CCFlatlist extends PureComponent {
    static propTypes = {
        ...FlatList.propTypes,
        data: PropTypes.array.isRequired,
        itemHeight: PropTypes.number,
        horizontal:PropTypes.bool,
        initialNumToRender: PropTypes.number,
        renderEmptyData: PropTypes.func,//暂无数据调用
        onScroll: PropTypes.func,
        scrollToOffset: PropTypes.func,//滚动到指定偏移位置
    };
    static defaultProps = {
        data: [],
        itemHeight: 100,
        initialNumToRender: 10,
        horizontal:false,
        renderEmptyData: () => {
            return (
                <Text >暂无数据</Text>
            );
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            ...FlatList.defaultProps,
            data: this.props.data,
            showFoot: SHOWFOOT.DONTSHOW,//0 不展示 1 无更多数据 2.加载中
        };
    }
   

    render() {
        const { data } = this.state;
        const { initialNumToRender, style, customStyle } = this.props;
        let flatlistStyle = [styles.flatList];
        if (style) {
            flatlistStyle.push(style);
        }
        if (customStyle) {
            flatlistStyle = customStyle;
        }
        return (
            <FlatList
                {...this.props}
                style={flatlistStyle}
                ref={this._listRef}
                onEndReachedThreshold={.2}
                horizontal={this.props.horizontal}
                contentContainerStyle={this.props.contentContainerStyle?this.props.contentContainerStyle:undefined}
                ListEmptyComponent={this._renderEmptyItem}
                data={data}
                keyExtractor={(item, index) => String(index)}
                initialNumToRender={initialNumToRender}
                renderItem={this._renderItem}
                onEndReached={() => { this._onEndReached() }}
                scrollToIndex={this.scrollToIndex}
                scrollToOffset={this._onScrollToOffset}
                ListFooterComponent={this._footerComponent}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                onMomentumScrollBegin={() => {
                    this.onEndReachedCalledDuringMomentum = false;
                }}
            />
        );
    }
    _renderEmptyItem = () => {
        const { ListEmptyComponent } = this.props;
        if (ListEmptyComponent) {
            return ListEmptyComponent();
        }
        return (
            <View style={styles.emptyView}>
                <View style={{marginTop:40}}>
                <Text style={[styles.noText,{textAlign:"center"}]}>暂无数据</Text>
                </View>
            </View>
        );

    }
    /**底部View */
    _footerComponent = () => {

        if(this.props.ListFooterComponent){
            return this.props.ListFooterComponent()
        }
        const { showFoot, data } = this.state;
        if (!data) {
            return null;
        }
        if (showFoot == SHOWFOOT.ALLOWED) {
            return (
                <View style={styles.noDataView}>
                    <View style={styles.lineView} />
                    <Text style={styles.noText}>
                        没有更多了
          </Text>
                    <View style={styles.lineView} />
                </View>
            );
        } else if (showFoot == SHOWFOOT.LOADING) {
            return (
                <View style={styles.noDataView}>
                    <ActivityIndicator />
                    <Text style={styles.loadingText}>加载中...</Text>
                </View>
            );
        } else if (showFoot == SHOWFOOT.DONTSHOW) {
            return (
                <View style={styles.noDataView}>
                    <Text></Text>
                </View>
            );
        }
    }
    /**滚动到指定偏移位置*/
    _onScrollToOffset = (params) => {
        this.list && this.list.scrollToIndex({ animated: params.animated, index: params.index - 1, viewPosition: 0 });
    }
    /**滚动方法 */
    _onScroll = (event) => {
        const { onScroll } = this.props;
        onScroll && onscroll(event);
    }
    /**渲染单个item */
    _renderItem = (data) => {

        return this.props.renderItem(data.item, data.index);
    }
    /**滚动到指定位置 */
    scrollToIndex = (index = 0) => {
        const { data } = this.state;
        if (data instanceof Array && data.length > 0) {
            this.list && this.list.scrollToIndex({ animated: true, index: index, viewPosition: 0 });
        }
        // return { animated: params.animated, index: params.index - 1, viewPosition: 0 };
    }
    /**加载头部View */
    _listHeaderComponent = () => {
        const { renderEmptyData } = this.props;
        const { data } = this.state;
        if (this.state.data.length > 0) {
            return null;
        } else {
            return this.props.renderEmptyData();
        }
    }

    _getItemLayout = (data, index) => {
        return { length: this.props.itemHeight, offset: this.props.itemHeight * index, index };
    }
    /**下拉刷新 */
    _onRefresh = () => {
        const { onRefresh } = this.props;
        onRefresh && onRefresh();
    }
    /**上拉加载更多 */
    _onEndReached = (info) => {
        if (!this.onEndReachedCalledDuringMomentum) {
            this.onEndReachedCalledDuringMomentum = true
            const { onEndReached } = this.props;
            onEndReached && onEndReached();
        }
    }
    /**ref */
    _listRef = (list) => {
        this.list = list;
    }
    /**flatList数据源 */
    setData(data, callBack = null) {
        this.setState({
            data: data,
        }, () => { callBack && callBack() });
    }
    /**
     * 渲染底部组件
     * @param {*底部状态值} status 
     */
    setFooterStatus(status) {
        this.setState({ showFoot: status });
    }
    /**获取到数据源 */
    getData() {
        const { data } = this.state;
        return data instanceof Array && data.length > 0 ? data : [];
    }
}
const styles = StyleSheet.create({

    flatList: {
       flex:1
    },
    lineView: {
        width: 60,
        height: 1,
        backgroundColor: '#E6E6E6'
    },
    noDataView: {
        flexDirection: 'row',
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24
    },
    noText: {
        color: '#C7C7C7',
        fontSize: 16,
        marginHorizontal: 24
    },
    loadingText: {
        fontSize: 16,
        marginLeft:5,
        color: "#8B8B8D"
    },
    emptyView: {
        width: width,
        height: height,
        // backgroundColor: '#f0f0f0',
        // justifyContent: 'center',
        alignItems: 'center'
    }
});

