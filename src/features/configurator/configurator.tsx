import React from "react";
import styles from "./configurator.module.css"
import { Avatar, Col, Divider, Layout, Row, Space } from "antd";
import Sider from "antd/es/layout/Sider";
import Title from "antd/es/typography/Title";



export function Configurator(){
    return(
        // <Space className={styles.configContainer} direction="horizontal" size={[0, 48]}>
        //     {/* <Layout> */}
        //         <Sider className={styles.sider}>
        //         <Space size={"small"} direction="vertical">
        //         <Title level={3}>Paint</Title>
        //         <Row gutter={5}>
        //             <Col className="gutter-row" span={3}>
        //             <Avatar style={{ backgroundColor: "yellow", verticalAlign: 'middle' }} size="default" gap={1}>
        //             </Avatar>
        //             </Col>
        //             <Col className="gutter-row" span={3}>
        //             <Avatar style={{ backgroundColor: "yellow", verticalAlign: 'middle' }} size="default" gap={1}>
        //             </Avatar>
        //             </Col>
  
        //         </Row>
        //         <Divider/>
        //         <Title level={3}>Options</Title>

        //         </Space>
        //         </Sider>
        //         <Layout>
        //             {/* <Header style={headerStyle}>Header</Header>
        //             <Content style={contentStyle}>Content</Content>
        //             <Footer style={footerStyle}>Footer</Footer> */}
        //         </Layout>
        //     {/* </Layout> */}
        // </Space>
        <div className={styles.configContainer}>
            <div className={styles.sider}>
                <div className={styles.siderTitle}>
                    Paint Options
                </div>
                <div className={styles.paintOptionContainer}>
                    {[1,2,3,4,5,6,7].map((i) => <div className={styles.paintOptionItem}>{i}</div>)}
                </div>
            </div>
        </div>
    )
}