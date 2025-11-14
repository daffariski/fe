import React from "react";


import Layout from "../_layout";

export default function Index() {
  
  return (<div className="">dashboard</div>);
}

Index.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};
