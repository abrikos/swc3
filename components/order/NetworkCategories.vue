<script setup lang="ts">
const route =useRoute()
const categories = ref<ICategory[]>([])
async function load(){
  categories.value = await useNuxtApp().$GET('/order/categories') as ICategory[]
  expandNode()
}
onMounted(load)
const expanded = ref()

function expandNode(id?:string){
  for(const c of categories.value){
    if(c.subcategories.map(cc=>cc.id).includes(id?id:route.query.sub)){
      expanded.value = [c.name]
    }
  }
}

function handler(e:any){
  navigateTo({query:{sub:e.id}})
  //expandNode(e.id)
}
const tree = computed(()=>{
  const t =[]
  for(const category of categories.value){
    t.push({
      label: category.name,
      selectable: true,
      handler:(e:any)=>{ expanded.value=[category.name]},
      children: category.subcategories
          .filter((c:ISubCategory)=>!c.deleted)
          .map((c:ISubCategory)=>({id:c.id, label:c.name, handler, selectable:true, disabled:c.id===route.query.sub})),
    })
  }
  return t
})
</script>

<template lang="pug">
  q-tree(:nodes="tree" node-key="label" v-model:expanded="expanded" )
    template(v-slot:header-active="props")
      div.selected {{subcat}}
</template>

<style scoped lang="sass">
div
  cursor: pointer
div.selected
  cursor: default
</style>