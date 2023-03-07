<template>
  <div style="height: 98vh; width: 100%">
    <sh-config-provider
      url="http://192.168.20.28:8089/clientadmin/role/getResources"
      userId="e5853279-bbd9-4785-9abb-92834633011b"
      schemeId="0c3eb7ec-c004-eefb-8c0f-81786210ebf3"
    >
      <sh-map-earth :viewMode="viewMode" >
        <sh-layer-switcher />
        <sh-layer-manager />
      </sh-map-earth>
    </sh-config-provider>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 地图模式: '2D' '23D' '3D'
      viewMode: '23D'
    };
  }
};
</script>
